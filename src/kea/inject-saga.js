import { createSaga } from '../saga/create'
import { startSaga, cancelSaga } from '../scene/store'
import { createCombinedSaga } from '../scene/saga'
import { select } from 'redux-saga/effects'

import { getCache } from './cache'

const DEBUG = false

export default function injectSagasIntoClass (Klass, _this, connectedActions, object) {
  if (Klass._injectedKeaSaga) {
    console.error('[KEA] Error! Already injected kea saga into component', Klass)
  }
  Klass._injectedKeaSaga = true

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
      const _component = this
      _component._keaSagaBase = {
        start: _this.start,
        stop: _this.stop,
        takeEvery: _this.takeEvery,
        takeLatest: _this.takeLatest,
        workers: _this.workers ? Object.assign({}, _this.workers) : {},
        key: key,
        path: path,
        props: this.props,
        get: function * (key) {
          const { selectors, selector } = getCache(path)
          return yield select(key ? selectors[key] : selector)
        },
        fetch: function * () {
          let results = {}
          const keys = Array.isArray(arguments[0]) ? arguments[0] : arguments
          for (let i = 0; i < keys.length; i++) {
            results[keys[i]] = yield _component._keaSagaBase.get(keys[i])
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
