import { selectPropsFromLogic } from './connect/props'
import { propTypesFromMapping } from './connect/prop-types'
import { combineReducerObjects, convertReducerArrays } from './logic/reducer'
import { pathSelector, createSelectors } from './logic/selectors'
import { createActions } from './actions/create'
import { selectActionsFromLogic } from './connect/actions'

import convertConstants from '../utils/convert-constants'
import shallowEqual from '../utils/shallow-equal'

import { createSelector } from 'reselect'
import { connectAdvanced } from 'react-redux'

import { setCache, getCache } from './cache'

import { firstReducerRoot, isSyncedWithStore, addReducer } from './reducer'

import { installedPlugins } from './plugins'

const DEBUG = false

let nonameCounter = 0

function isStateless (Component) {
  return !Component.prototype.render
}

const hydrationAction = '@@kea/hydrate store'

export function kea (input) {
  const hasConnect = !!(input.connect)
  const hasLogic = !!(input.path || input.actions || input.reducers || input.selectors)
  const isSingleton = !input.key

  let output = {}

  // check which plugins are active
  output.activePlugins = []
  installedPlugins.forEach(plugin => {
    output.activePlugins[plugin.name] = plugin.isActive(input, output)
  })

  if (!input.path) {
    const reducerRoot = firstReducerRoot()
    if (!reducerRoot) {
      console.error('[KEA] Could not find the root of the keaReducer! Make sure you call keaReducer() before any call to kea() is made. See: https://kea.js.org/api/reducer')
    }
    let inlinePath = [reducerRoot, '_kea', `inline-${nonameCounter++}`]
    input.path = () => inlinePath
  }

  let propTypes = {}
  let connect = {}

  if (hasConnect) {
    // the { connect: { props, actions } } part
    connect = input.connect || {}

    // get default proptypes and add connected ones
    propTypes = Object.assign({}, connect.props ? propTypesFromMapping(connect) : {})

    // connected actions and props/selectors
    output.connected = {
      actions: selectActionsFromLogic(connect.actions),
      selectors: selectPropsFromLogic(connect.props)
    }

    if (isSingleton) {
      output.actions = Object.assign({}, output.connected.actions)
      output.selectors = Object.assign({}, output.connected.selectors)
    }

    installedPlugins.forEach(plugin => {
      plugin.afterConnect && plugin.afterConnect(output.activePlugins[plugin.name], input, output)
    })
  }

  // pregenerate as many things as we can
  output.constants = input.constants ? convertConstants(input.constants(output)) : {}

  if (hasLogic) {
    // we don't know yet if it's going to be a singleton (no key) or inline (key)
    // however the actions and constants are common for all, so get a path without the dynamic
    // component and initialize them
    output.path = input.path('').filter(p => p)
    output.actions = Object.assign({}, output.actions, input.actions ? createActions(input.actions(output), output.path) : {})
    output.props = {}

    installedPlugins.forEach(plugin => {
      plugin.afterCreateActions && plugin.afterCreateActions(output.activePlugins[plugin.name], input, output)
    })
  }

  if (hasLogic && isSingleton) {
    output.selector = (state) => pathSelector(output.path, state)
    output.reducers = input.reducers ? convertReducerArrays(input.reducers(output)) : {}
    output.reducer = input.reducer ? input.reducer(output) : combineReducerObjects(output.path, output.reducers)
    output.selectors = Object.assign({}, output.selectors, createSelectors(output.path, Object.keys(output.reducers || {})))

    const selectorResponse = input.selectors ? input.selectors(output) : {}
    Object.keys(selectorResponse).forEach(selectorKey => {
      // s == [() => args, selectorFunction, propType]
      const s = selectorResponse[selectorKey]
      const args = s[0]()
      if (s[2]) {
        output.reducers[selectorKey] = { type: s[2] }
      }
      output.selectors[selectorKey] = createSelector(...args, s[1])
    })

    installedPlugins.forEach(plugin => {
      plugin.afterAddSingletonLogic && plugin.afterAddSingletonLogic(output.activePlugins[plugin.name], input, output)
    })
  }

  if (isSingleton) {
    installedPlugins.forEach(plugin => {
      plugin.afterCreateSingleton && plugin.afterCreateSingleton(output.activePlugins[plugin.name], input, output)
    })
  }

  const response = function (Klass) {
    // initializing as a singleton
    if (Klass === false) {
      if (!isSingleton) {
        console.error(`[KEA-LOGIC] Standalone "export default kea({})" functions must have no "key"!`, output.path, Klass)
      }

      return Object.assign(input, output)
    }

    if (Klass && Klass.propTypes) {
      propTypes = Object.assign({}, propTypes, Klass.propTypes)
    }

    if (hasLogic) {
      // add proptypes from reducer
      const reducers = input.reducers ? convertReducerArrays(input.reducers(output)) : {}
      Object.keys(reducers).forEach(reducerKey => {
        if (reducers[reducerKey].type) {
          propTypes[reducerKey] = reducers[reducerKey].type
        }
      })

      // add proptypes from selectors
      const selectorsThatDontWork = input.selectors ? input.selectors({}) : {}
      Object.keys(selectorsThatDontWork).forEach(selectorKey => {
        if (selectorsThatDontWork[selectorKey][2]) {
          propTypes[selectorKey] = selectorsThatDontWork[selectorKey][2]
        }
      })
    }

    if (Klass) {
      Klass.propTypes = Object.assign({}, propTypes, Klass.propTypes || {})
    }

    if (Klass && hasLogic) {
      // add kea metadata to component
      Klass.kea = {
        path: input.path,
        constants: output.constants,
        actions: output.actions,
        select: (key) => getCache(input.path(key), 'selectors')
      }
    }

    if (Klass && (hasLogic || hasConnect)) {
      // convert this.props.actions to this.actions in the component
      const originalComponentWillMount = Klass.prototype.componentWillMount
      Klass.prototype.componentWillMount = function () {
        this.actions = this.props.actions
        originalComponentWillMount && originalComponentWillMount.bind(this)()
      }
    }

    // If we're wrapping a functional React component, skip adding plugins.
    // This requires lifecycle methods like componentWillMount, etc, which functional components don't have.
    // We'll instead add plugins to Redux's Connected class.
    if (Klass && !isStateless(Klass)) {
      installedPlugins.forEach(plugin => {
        plugin.injectToClass && plugin.injectToClass(output.activePlugins[plugin.name], input, output, Klass)
      })
    }

    const selectorFactory = (dispatch, options) => {
      let lastProps = {}
      let result = null

      if (!isSyncedWithStore()) {
        dispatch({type: hydrationAction})
      }

      return (nextState, nextOwnProps) => {
        let key
        let path
        let joinedPath

        let nextProps = Object.assign({}, nextOwnProps)

        if (hasConnect) {
          // TODO: this will fail if the redux tree is not initialized yet.
          // see comment in logic-component.js

          // connected props
          Object.keys(output.connected.selectors).forEach(propKey => {
            nextProps[propKey] = output.connected.selectors[propKey](nextState, nextOwnProps)
          })
        }

        if (hasLogic) {
          key = input.key ? input.key(nextOwnProps) : 'index'

          if (typeof key === 'undefined') {
            console.error(`"key" can't be undefined in path: ${input.path('undefined').join('.')}`)
          }

          path = input.path(key)
          joinedPath = path.join('.')

          if (DEBUG) {
            console.log(`Inline selectorFactory for ${joinedPath}`)
            console.log({ nextOwnProps, nextState, key, path })
          }

          let selector
          let selectors

          // now we must check if the reducer is already in redux, or we need to add it
          // if we need to add it, create "dummy" selectors for the default values until then

          // is the reducer created? if we have "true" in the cache, it's definitely created
          let reducerCreated = !!getCache(joinedPath, 'reducerCreated')

          // if it's not let's double check. maybe it is now?
          if (!reducerCreated) {
            try {
              selector = (state) => pathSelector(path, state)
              reducerCreated = typeof selector(nextState) !== 'undefined'
            } catch (e) {
              reducerCreated = false
            }
          }

          // we have the selectors cached! with the current reducerCreated state!
          if (!!getCache(joinedPath, reducerCreated) === reducerCreated) {
            if (DEBUG) {
              console.log('cache hit!')
            }
            selector = getCache(joinedPath, 'selector')
            selectors = getCache(joinedPath, 'selectors')

          // either we have nothing cached or the cache is invalid. regenerate the selectors!
          } else {
            if (!selector) {
              selector = (state) => pathSelector(path, state)
            }

            // add { path } and { key } to the reducer creator function
            let localObject = Object.assign({}, output, { path, key, props: nextOwnProps })
            localObject.reducers = input.reducers ? convertReducerArrays(input.reducers(localObject)) : {}
            localObject.reducer = input.reducer ? input.reducer(localObject) : combineReducerObjects(path, localObject.reducers)

            const connectedSelectors = output.connected ? output.connected.selectors : {}

            // if the reducer is in redux, get real reducer selectors. otherwise add dummies that return defaults
            if (reducerCreated) {
              selectors = Object.assign({}, connectedSelectors || {}, createSelectors(path, Object.keys(localObject.reducers)))
            } else {
              addReducer(path, localObject.reducer, true)
              if (!isSyncedWithStore()) {
                dispatch({type: hydrationAction})
              }

              const realSelectors = createSelectors(path, Object.keys(localObject.reducers))

              // if we don't know for sure that the reducer is in the current store output,
              // then fallback to giving the default value
              selectors = Object.assign({}, connectedSelectors || {})
              Object.keys(localObject.reducers).forEach(key => {
                selectors[key] = (state) => {
                  try {
                    return realSelectors[key](state)
                  } catch (error) {
                    return localObject.reducers[key].value
                  }
                }
              })
            }

            // create
            const selectorResponse = input.selectors ? input.selectors(Object.assign({}, localObject, { selectors })) : {}

            Object.keys(selectorResponse).forEach(selectorKey => {
              // s == [() => args, selectorFunction, propType]
              const s = selectorResponse[selectorKey]

              const args = s[0]()
              selectors[selectorKey] = createSelector(...args, s[1])
            })

            // store in the cache
            setCache(joinedPath, {
              reducerCreated,
              selector,
              selectors
            })
          }

          if (DEBUG) {
            console.log({ selector, selectors })
          }

          Object.keys(selectors).forEach(selectorKey => {
            nextProps[selectorKey] = selectors[selectorKey](nextState, nextOwnProps)
          })
        }

        if (DEBUG) {
          console.log({ nextProps })
        }

        // TODO: cache these even if no path present
        let actions = joinedPath ? getCache(joinedPath, 'actions') : null

        if (!actions) {
          actions = {}

          if (hasConnect) {
            // pass conneted actions as they are
            Object.keys(output.connected.actions).forEach(actionKey => {
              actions[actionKey] = (...args) => dispatch(output.connected.actions[actionKey](...args))
            })
          }

          if (hasLogic) {
            // inject key to the payload of inline actions
            Object.keys(output.actions).forEach(actionKey => {
              actions[actionKey] = (...args) => {
                const createdAction = output.actions[actionKey](...args)
                return dispatch(Object.assign({}, createdAction, { payload: Object.assign({ key: key }, createdAction.payload) }))
              }
            })
          }

          if (DEBUG) {
            console.log({ actions })
          }

          if (joinedPath) {
            setCache(joinedPath, { actions })
          }
        }

        // if the props did not change, return the old cached output
        if (!result || !shallowEqual(lastProps, nextProps)) {
          lastProps = nextProps
          result = Object.assign({}, nextProps, { actions, dispatch })
        }

        return result
      }
    }

    const KonnektedKlass = connectAdvanced(selectorFactory, { methodName: 'kea' })(Klass)

    // If we were wrapping a functional React component, add the plugin code to the connected component.
    if (Klass && isStateless(Klass)) {
      installedPlugins.forEach(plugin => {
        plugin.injectToConnectedClass && plugin.injectToConnectedClass(output.activePlugins[plugin.name], input, output, KonnektedKlass)
      })
    }

    return KonnektedKlass
  }

  response.path = output.path
  response.constants = output.constants
  response.actions = output.actions
  response.reducer = output.reducer
  response.reducers = output.reducers
  response.selector = output.selector
  response.selectors = output.selectors

  response._isKeaFunction = true
  response._isKeaSingleton = isSingleton
  response._hasKeaConnect = hasConnect
  response._hasKeaLogic = hasLogic
  response._keaPlugins = output.activePlugins

  installedPlugins.forEach(plugin => {
    plugin.addToResponse && plugin.addToResponse(output.activePlugins[plugin.name], input, output, response)
  })

  if (output.path) {
    if (isSingleton) {
      addReducer(output.path, output.reducer, true)
      response._keaReducerConnected = true
    } else {
      response._keaReducerConnected = false
    }
  }

  return response
}
