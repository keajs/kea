/* global test, expect, beforeEach */
import { kea } from '../logic/kea'
import { clearActionCache } from '../logic/actions'
import { keaReducer, keaSaga, clearStore } from '../scene/store'

import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'

import { PropTypes } from 'react'

beforeEach(() => {
  clearActionCache()
  clearStore()
})

test('can have a kea with only a saga', () => {
  let sagaRan = false

  const firstLogic = kea({
    start: function * () {
      expect(this.get).not.toBeDefined()
      expect(this.fetch).not.toBeDefined()
      sagaRan = true
    }
  })

  expect(firstLogic._isKeaSingleton).toBe(true)
  expect(firstLogic._hasKeaConnect).toBe(false)
  expect(firstLogic._hasKeaLogic).toBe(false)
  expect(firstLogic._hasKeaSaga).toBe(true)

  expect(firstLogic.saga).toBeDefined()

  expect(sagaRan).toBe(false)

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })
  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)
  finalCreateStore(reducers)

  sagaMiddleware.run(firstLogic.saga)

  expect(sagaRan).toBe(true)
})

test('can access defined actions', () => {
  let sagaRan = false

  const firstLogic = kea({
    actions: () => ({
      doSomething: (input) => ({ input })
    }),
    start: function * () {
      expect(this.path).toBeDefined()
      expect(this.actions).toBeDefined()
      expect(this.get).toBeDefined()
      expect(this.fetch).toBeDefined()
      expect(Object.keys(this.actions)).toEqual([ 'doSomething' ])

      const { doSomething } = this.actions
      expect(doSomething('input-text')).toEqual({ type: doSomething.toString(), payload: { input: 'input-text' } })

      sagaRan = true
    }
  })

  expect(firstLogic._isKeaSingleton).toBe(true)
  expect(firstLogic._hasKeaConnect).toBe(false)
  expect(firstLogic._hasKeaLogic).toBe(true)
  expect(firstLogic._hasKeaSaga).toBe(true)

  expect(firstLogic.saga).toBeDefined()

  expect(sagaRan).toBe(false)

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })
  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)
  finalCreateStore(reducers)

  sagaMiddleware.run(firstLogic.saga)

  expect(sagaRan).toBe(true)
})

test('takeEvery and takeLatest work', () => {
  let sagaRan = false
  let everyRan = false
  let latestRan = false

  const firstLogic = kea({
    actions: () => ({
      doEvery: (input) => ({ input }),
      doLatest: (input) => ({ input })
    }),
    start: function * () {
      expect(this.get).toBeDefined()
      expect(this.fetch).toBeDefined()
      sagaRan = true
    },
    takeEvery: ({ actions, workers }) => ({
      [actions.doEvery]: workers.doEvery
    }),
    takeLatest: ({ actions, workers }) => ({
      [actions.doLatest]: workers.doLatest
    }),
    workers: {
      * doEvery () {
        expect(this.actions).toBeDefined()
        expect(this.get).toBeDefined()
        expect(this.fetch).toBeDefined()
        everyRan = true
      },
      * doLatest () {
        latestRan = true
      }
    }
  })

  expect(firstLogic._isKeaSingleton).toBe(true)
  expect(firstLogic._hasKeaConnect).toBe(false)
  expect(firstLogic._hasKeaLogic).toBe(true)
  expect(firstLogic._hasKeaSaga).toBe(true)

  expect(firstLogic.saga).toBeDefined()

  expect(sagaRan).toBe(false)

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })
  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)

  const store = finalCreateStore(reducers)

  sagaMiddleware.run(keaSaga)
  sagaMiddleware.run(firstLogic.saga)

  store.dispatch(firstLogic.actions.doEvery('input-every'))
  store.dispatch(firstLogic.actions.doLatest('input-latest'))

  expect(sagaRan).toBe(true)
  expect(everyRan).toBe(true)
  expect(latestRan).toBe(true)
})

// test fetch and with reducers
// test connected sagas
// test sagas on component instances
