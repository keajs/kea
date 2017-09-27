import { select, call } from 'redux-saga/effects'

import createSaga from './create-saga'
import getConnectedSagas from './get-connected'
import injectSagasIntoClass from './inject-to-component'
import createCombinedSaga from './create-combined'

import { activatePlugin } from '../plugins'

activatePlugin({
  name: 'saga',

  isActive: (input) => {
    return !!(input.sagas || input.start || input.stop || input.takeEvery || input.takeLatest || (input.connect && input.connect.sagas))
  },

  afterConnect: (active, input, output) => {
    const connect = input.connect || {}
    const connectedSagas = getConnectedSagas(connect)

    // sagas we automatically connect from actions && props
    if (connectedSagas.length > 0) {
      output.activePlugins.saga = true
      input.sagas = input.sagas ? input.sagas.concat(connectedSagas) : connectedSagas
    }

    // we have input: { connect: { sagas: [] } }, add to input: { sagas: [] }
    if (connect.sagas) {
      input.sagas = input.sagas ? input.sagas.concat(connect.sagas) : connect.sagas
    }
  },

  afterAddSingletonLogic: (active, input, output) => {
    output.get = function * (key) {
      return yield select(key ? output.selectors[key] : output.selector)
    }

    output.fetch = function * () {
      let results = {}

      const keys = Array.isArray(arguments[0]) ? arguments[0] : arguments

      for (let i = 0; i < keys.length; i++) {
        results[keys[i]] = yield output.get(keys[i])
      }

      return results
    }
  },

  afterCreateSingleton: (active, input, output) => {
    if (active) {
      output.saga = function * () {
        let sagas = (input.sagas || []).map(saga => {
          return saga && saga._keaPlugins && saga._keaPlugins.saga && saga.saga ? saga.saga : saga
        })

        if (input.start || input.stop || input.takeEvery || input.takeLatest) {
          if (!output._createdSaga) {
            const hasSelectors = !!(output.selectors && Object.keys(output.selectors).length > 0)
            const _singletonSagaBase = {
              start: input.start,
              stop: input.stop,
              takeEvery: input.takeEvery,
              takeLatest: input.takeLatest,
              workers: input.workers ? Object.assign({}, input.workers) : {},
              key: output.key,
              path: output.path,
              get: hasSelectors ? function * (key) {
                return yield select(key ? output.selectors[key] : output.selector)
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

            let sagaActions = Object.assign({}, output.actions)

            output._createdSaga = createSaga(_singletonSagaBase, { actions: sagaActions })
          }

          sagas.push(output._createdSaga)
        }

        const sagaPath = output.path ? output.path.join('.') : input.path('').filter(p => p).join('.')
        yield call(createCombinedSaga(sagas, sagaPath))
      }
    }
  },

  injectToClass: (active, input, output, Klass) => {
    if (active) {
      injectSagasIntoClass(Klass, input, output)
    }
  },

  injectToConnectedClass: (active, input, output, KonnektedKlass) => {
    if (active) {
      injectSagasIntoClass(KonnektedKlass, input, output)
    }
  },

  addToResponse: (active, input, output, response) => {
    response.saga = output.saga
    response.get = output.get
    response.fetch = output.fetch
  }
})
