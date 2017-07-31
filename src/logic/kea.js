import { createPropTransforms, propTypesFromMapping } from '../logic/props'
import { createActions, createActionTransforms } from '../logic/actions'
import { combineReducerObjects, convertReducerArrays } from '../logic/reducer'
import { convertConstants } from '../logic/create'
import { pathSelector, createSelectors } from '../logic/selectors'
import { createSaga } from '../saga/create'
import { getConnectedSagas } from '../saga/connected'
import { firstReducerRoot, addReducer, startSaga, cancelSaga } from '../scene/store'
import { createCombinedSaga } from '../scene/saga'
import shallowEqual from '../utils/shallow-equal'

import { createSelector } from 'reselect'
import { select, call } from 'redux-saga/effects'
import { connectAdvanced } from 'react-redux'

let inlineCache = {}
let actionCache = {}

export function cachedSelectors (path) {
  return inlineCache[path.join('.')] || {}
}

const DEBUG = false

let nonameCounter = 0

export function kea (_this) {
  const hasConnect = !!(_this.connect)
  const hasLogic = !!(_this.path || _this.actions || _this.reducer || _this.selectors)
  const hasSaga = !!(_this.sagas || _this.start || _this.stop || _this.takeEvery || _this.takeLatest || (_this.connect && _this.connect.sagas))
  const isSingleton = !_this.key

  let object = {}

  if (!_this.path) {
    let inlinePath = [firstReducerRoot(), '_kea', `inline-${nonameCounter++}`]
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
    connectedActions = createActionTransforms(connect.actions).actions
    connectedSelectors = createPropTransforms(connect.props).selectorFunctions

    if (isSingleton) {
      object.actions = Object.assign({}, connectedActions)
      object.selectors = Object.assign({}, connectedSelectors)
    }

    const connectedSagas = getConnectedSagas(connect)

    // sagas we automatically connect from actions && props
    if (connectedSagas.length > 0) {
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

    if (Klass && hasLogic) {
      // add kea metadata to component
      Klass.kea = {
        path: _this.path,
        constants: object.constants,
        actions: object.actions,
        select: (key) => cachedSelectors(_this.path(key))
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

    // check for sagas
    if (Klass && hasSaga) {
      const originalComponentDidMount = Klass.prototype.componentDidMount
      Klass.prototype.componentDidMount = function () {
        if (DEBUG) {
          console.log('component did mount')
        }

        // this === component instance
        this._keaSagaBase = {}
        this._keaRunningSaga = null

        const key = _this.key ? _this.key(this.props) : 'index'
        const path = _this.path(key)

        let sagas = (_this.sagas || []).map(saga => {
          return saga && saga._hasKeaSaga && saga.saga ? saga.saga : saga
        })

        if (_this.start || _this.stop || _this.takeEvery || _this.takeLatest) {
          this._keaSagaBase = {
            start: _this.start,
            stop: _this.stop,
            takeEvery: _this.takeEvery,
            takeLatest: _this.takeLatest,
            workers: _this.workers ? Object.assign({}, _this.workers) : {},
            key: key,
            path: path,
            props: this.props,
            get: function * (key) {
              const { selectors, selector } = cachedSelectors(path)
              return yield select(key ? selectors[key] : selector)
            },
            fetch: function * () {
              let results = {}
              const keys = Array.isArray(arguments[0]) ? arguments[0] : arguments
              for (let i = 0; i < keys.length; i++) {
                results[keys[i]] = yield this._keaSagaBase.get(keys[i])
              }
              return results
            }
          }

          let sagaActions = Object.assign({}, connectedActions)

          // inject key to the payload of inline actions
          Object.keys(object.actions || {}).forEach(actionKey => {
            sagaActions[actionKey] = (...args) => {
              const createdAction = object.actions[actionKey](...args)
              return Object.assign({}, createdAction, { payload: Object.assign({ key: key }, createdAction.payload) })
            }
            sagaActions[actionKey].toString = object.actions[actionKey].toString
          })

          const saga = createSaga(this._keaSagaBase, { actions: sagaActions })
          sagas.push(saga)
        }

        if (sagas.length > 0) {
          this._keaRunningSaga = startSaga(createCombinedSaga(sagas, path.join('.')))
        }

        originalComponentDidMount && originalComponentDidMount.bind(this)()
      }

      const originalComponentWillReceiveProps = Klass.prototype.componentWillReceiveProps
      Klass.prototype.componentWillReceiveProps = function (nextProps) {
        this._keaSagaBase.props = nextProps

        originalComponentWillReceiveProps && originalComponentWillReceiveProps.bind(this)(nextProps)
      }

      const originalComponentWillUnmount = Klass.prototype.componentWillUnmount
      Klass.prototype.componentWillUnmount = function () {
        if (DEBUG) {
          console.log('component will unmount')
        }
        if (this._keaRunningSaga) {
          cancelSaga(this._keaRunningSaga)
        }

        originalComponentWillUnmount && originalComponentWillUnmount.bind(this)()
      }
    }

    const selectorFactory = (dispatch, options) => {
      let lastProps = {}
      let result = null

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
            nextProps[propKey] = connectedSelectors[propKey](nextState)
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
          let reducerCreated = inlineCache[joinedPath] && inlineCache[joinedPath].reducerCreated

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
          if (inlineCache[joinedPath] && inlineCache[joinedPath].reducerCreated === reducerCreated) {
            if (DEBUG) {
              console.log('cache hit!')
            }
            selector = inlineCache[joinedPath].selector
            selectors = inlineCache[joinedPath].selectors

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
              selectors = createSelectors(path, Object.keys(localObject.reducers))
            } else {
              addReducer(path, localObject.reducer, true)

              const realSelectors = createSelectors(path, Object.keys(localObject.reducers))

              // if we don't know for sure that the reducer is in the current store object,
              // then fallback to giving the default value
              selectors = {}
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
            inlineCache[joinedPath] = {
              reducerCreated,
              selector,
              selectors
            }
          }

          if (DEBUG) {
            console.log({ selector, selectors })
          }

          Object.keys(selectors).forEach(selectorKey => {
            nextProps[selectorKey] = selectors[selectorKey](nextState)
          })
        }

        if (DEBUG) {
          console.log({ nextProps })
        }

        // TODO: cache these even if no path present
        let actions = joinedPath ? actionCache[joinedPath] : null

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
            actionCache[joinedPath] = actions
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

    return connectAdvanced(selectorFactory, { methodName: 'kea' })(Klass)
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
