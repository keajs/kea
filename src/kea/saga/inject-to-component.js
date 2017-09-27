import { select } from 'redux-saga/effects'

import { startSaga, cancelSaga } from './index'

import createSaga from './create-saga'
import createCombinedSaga from './create-combined'
import { getCache } from '../cache'

const DEBUG = false

export default function injectSagasIntoClass (Klass, input, output) {
  const connectedActions = output.connected ? output.connected.actions : {}

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

    const key = input.key ? input.key(this.props) : 'index'
    const path = input.path(key)

    let sagas = (input.sagas || []).map(saga => {
      return saga && saga._keaPlugins && saga._keaPlugins.saga && saga.saga ? saga.saga : saga
    })

    if (input.start || input.stop || input.takeEvery || input.takeLatest) {
      const _component = this
      _component._keaSagaBase = {
        start: input.start,
        stop: input.stop,
        takeEvery: input.takeEvery,
        takeLatest: input.takeLatest,
        workers: input.workers ? Object.assign({}, input.workers) : {},
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
      Object.keys(output.actions || {}).forEach(actionKey => {
        sagaActions[actionKey] = (...args) => {
          const createdAction = output.actions[actionKey](...args)
          return Object.assign({}, createdAction, { payload: Object.assign({ key: key }, createdAction.payload) })
        }
        sagaActions[actionKey].toString = output.actions[actionKey].toString
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
