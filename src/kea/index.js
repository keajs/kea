import { selectPropsFromLogic } from './connect/props'
import { propTypesFromMapping } from './connect/prop-types'
import { combineReducerObjects, convertReducerArrays } from './logic/reducer'
import { pathSelector, createSelectors } from './logic/selectors'
import { createActions } from './actions/create'
import { selectActionsFromLogic } from './connect/actions'

import convertConstants from '../utils/convert-constants'
import shallowEqual from '../utils/shallow-equal'

import { createSelector } from 'reselect'
import { select, call } from 'redux-saga/effects'
import { connectAdvanced } from 'react-redux'

import { setCache, getCache } from './cache'

import { firstReducerRoot, isSyncedWithStore, addReducer } from './reducer'

import createSaga from './saga/create-saga'
import getConnectedSagas from './saga/get-connected'
import injectSagasIntoClass from './saga/inject-to-component'
import createCombinedSaga from './saga/create-combined'

const DEBUG = false

let nonameCounter = 0

function isStateless (Component) {
  return !Component.prototype.render
}

const hydrationAction = '@@kea/hydrate store'

export function kea (_this) {
  const hasConnect = !!(_this.connect)
  const hasLogic = !!(_this.path || _this.actions || _this.reducers || _this.selectors)
  let hasSaga = !!(_this.sagas || _this.start || _this.stop || _this.takeEvery || _this.takeLatest || (_this.connect && _this.connect.sagas))
  const isSingleton = !_this.key

  let object = {}

  if (!_this.path) {
    const reducerRoot = firstReducerRoot()
    if (!reducerRoot) {
      console.error('[KEA] Could not find the root of the keaReducer! Make sure you call keaReducer() before any call to kea() is made. See: https://kea.js.org/api/reducer')
    }
    let inlinePath = [reducerRoot, '_kea', `inline-${nonameCounter++}`]
    _this.path = () => inlinePath
  }

  let propTypes = {}
  let connect = {}
  let connectedActions = {}
  let connectedSelectors = {}

  if (hasConnect) {
    // the { connect: { props, actions } } part
    connect = _this.connect || {}

    // get default proptypes and add connected ones
    propTypes = Object.assign({}, connect.props ? propTypesFromMapping(connect) : {})

    // connected actions and props/selectors
    connectedActions = selectActionsFromLogic(connect.actions)
    connectedSelectors = selectPropsFromLogic(connect.props)

    if (isSingleton) {
      object.actions = Object.assign({}, connectedActions)
      object.selectors = Object.assign({}, connectedSelectors)
    }

    const connectedSagas = getConnectedSagas(connect)

    // sagas we automatically connect from actions && props
    if (connectedSagas.length > 0) {
      hasSaga = true
      _this.sagas = _this.sagas ? _this.sagas.concat(connectedSagas) : connectedSagas
    }

    // we have _this: { connect: { sagas: [] } }, add to _this: { sagas: [] }
    if (connect.sagas) {
      _this.sagas = _this.sagas ? _this.sagas.concat(connect.sagas) : connect.sagas
    }
  }

  // pregenerate as many things as we can
  object.constants = _this.constants ? convertConstants(_this.constants(object)) : {}

  if (hasLogic) {
    // we don't know yet if it's going to be a singleton (no key) or inline (key)
    // however the actions and constants are common for all, so get a path without the dynamic
    // component and initialize them
    object.path = _this.path('').filter(p => p)
    object.actions = Object.assign({}, object.actions, _this.actions ? createActions(_this.actions(object), object.path) : {})
    object.props = {}
  }

  if (hasLogic && isSingleton) {
    object.selector = (state) => pathSelector(object.path, state)
    object.reducers = _this.reducers ? convertReducerArrays(_this.reducers(object)) : {}
    object.reducer = _this.reducer ? _this.reducer(object) : combineReducerObjects(object.path, object.reducers)
    object.selectors = Object.assign({}, object.selectors, createSelectors(object.path, Object.keys(object.reducers || {})))

    const selectorResponse = _this.selectors ? _this.selectors(object) : {}
    Object.keys(selectorResponse).forEach(selectorKey => {
      // s == [() => args, selectorFunction, propType]
      const s = selectorResponse[selectorKey]
      const args = s[0]()
      if (s[2]) {
        object.reducers[selectorKey] = { type: s[2] }
      }
      object.selectors[selectorKey] = createSelector(...args, s[1])
    })

    object.get = function * (key) {
      return yield select(key ? object.selectors[key] : object.selector)
    }

    object.fetch = function * () {
      let results = {}

      const keys = Array.isArray(arguments[0]) ? arguments[0] : arguments

      for (let i = 0; i < keys.length; i++) {
        results[keys[i]] = yield object.get(keys[i])
      }

      return results
    }
  }

  if (hasSaga && isSingleton) {
    object.saga = function * () {
      let sagas = (_this.sagas || []).map(saga => {
        return saga && saga._hasKeaSaga && saga.saga ? saga.saga : saga
      })

      if (_this.start || _this.stop || _this.takeEvery || _this.takeLatest) {
        if (!object._createdSaga) {
          const hasSelectors = !!(object.selectors && Object.keys(object.selectors).length > 0)
          const _singletonSagaBase = {
            start: _this.start,
            stop: _this.stop,
            takeEvery: _this.takeEvery,
            takeLatest: _this.takeLatest,
            workers: _this.workers ? Object.assign({}, _this.workers) : {},
            key: object.key,
            path: object.path,
            get: hasSelectors ? function * (key) {
              return yield select(key ? object.selectors[key] : object.selector)
            } : undefined,
            fetch: hasSelectors ? function * () {
              let results = {}
              const keys = Array.isArray(arguments[0]) ? arguments[0] : arguments
              for (let i = 0; i < keys.length; i++) {
                results[keys[i]] = yield this.get(keys[i])
              }
              return results
            } : undefined
          }

          let sagaActions = Object.assign({}, connectedActions, object.actions)

          object._createdSaga = createSaga(_singletonSagaBase, { actions: sagaActions })
        }

        sagas.push(object._createdSaga)
      }

      const sagaPath = object.path ? object.path.join('.') : _this.path('').filter(p => p).join('.')
      yield call(createCombinedSaga(sagas, sagaPath))
    }
  }

  const response = function (Klass) {
    // initializing as a singleton
    if (Klass === false) {
      if (!isSingleton) {
        console.error(`[KEA-LOGIC] Standalone "export default kea({})" functions must have no "key"!`, object.path, Klass)
      }

      return Object.assign(_this, object)
    }

    if (Klass && Klass.propTypes) {
      propTypes = Object.assign({}, propTypes, Klass.propTypes)
    }

    if (hasLogic) {
      // add proptypes from reducer
      const reducers = _this.reducers ? convertReducerArrays(_this.reducers(object)) : {}
      Object.keys(reducers).forEach(reducerKey => {
        if (reducers[reducerKey].type) {
          propTypes[reducerKey] = reducers[reducerKey].type
        }
      })

      // add proptypes from selectors
      const selectorsThatDontWork = _this.selectors ? _this.selectors({}) : {}
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
        path: _this.path,
        constants: object.constants,
        actions: object.actions,
        select: (key) => getCache(_this.path(key), 'selectors')
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

    // If we're wrapping a functional React component, skip adding sagas.
    // This requires lifecycle methods like componentWillMount, etc, which functional components don't have.
    // We'll instead add sagas to Redux's Connected class.
    if (Klass && hasSaga && !isStateless(Klass)) {
      injectSagasIntoClass(Klass, _this, connectedActions, object)
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
          Object.keys(connectedSelectors).forEach(propKey => {
            nextProps[propKey] = connectedSelectors[propKey](nextState, nextOwnProps)
          })
        }

        if (hasLogic) {
          key = _this.key ? _this.key(nextOwnProps) : 'index'

          if (typeof key === 'undefined') {
            console.error(`"key" can't be undefined in path: ${_this.path('undefined').join('.')}`)
          }

          path = _this.path(key)
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
            let localObject = Object.assign({}, object, { path, key, props: nextOwnProps })
            localObject.reducers = _this.reducers ? convertReducerArrays(_this.reducers(localObject)) : {}
            localObject.reducer = _this.reducer ? _this.reducer(localObject) : combineReducerObjects(path, localObject.reducers)

            // if the reducer is in redux, get real reducer selectors. otherwise add dummies that return defaults
            if (reducerCreated) {
              selectors = Object.assign({}, connectedSelectors || {}, createSelectors(path, Object.keys(localObject.reducers)))
            } else {
              addReducer(path, localObject.reducer, true)
              if (!isSyncedWithStore()) {
                dispatch({type: hydrationAction})
              }

              const realSelectors = createSelectors(path, Object.keys(localObject.reducers))

              // if we don't know for sure that the reducer is in the current store object,
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
            const selectorResponse = _this.selectors ? _this.selectors(Object.assign({}, localObject, { selectors })) : {}

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
            Object.keys(connectedActions).forEach(actionKey => {
              actions[actionKey] = (...args) => dispatch(connectedActions[actionKey](...args))
            })
          }

          if (hasLogic) {
            // inject key to the payload of inline actions
            Object.keys(object.actions).forEach(actionKey => {
              actions[actionKey] = (...args) => {
                const createdAction = object.actions[actionKey](...args)
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

        // if the props did not change, return the old cached object
        if (!result || !shallowEqual(lastProps, nextProps)) {
          lastProps = nextProps
          result = Object.assign({}, nextProps, { actions, dispatch })
        }

        return result
      }
    }

    const KonnektedKlass = connectAdvanced(selectorFactory, { methodName: 'kea' })(Klass)

    // If we were wrapping a functional React component, add the saga code to the connected component.
    if (Klass && hasSaga && isStateless(Klass)) {
      injectSagasIntoClass(KonnektedKlass, _this, connectedActions, object)
    }

    return KonnektedKlass
  }

  response.path = object.path
  response.constants = object.constants
  response.actions = object.actions
  response.reducer = object.reducer
  response.reducers = object.reducers
  response.selector = object.selector
  response.selectors = object.selectors
  response.saga = object.saga
  response.get = object.get
  response.fetch = object.fetch

  response._isKeaFunction = true
  response._isKeaSingleton = isSingleton
  response._hasKeaConnect = hasConnect
  response._hasKeaLogic = hasLogic
  response._hasKeaSaga = hasSaga

  if (object.path) {
    if (isSingleton) {
      addReducer(object.path, object.reducer, true)
      response._keaReducerConnected = true
    } else {
      response._keaReducerConnected = false
    }
  }

  return response
}
