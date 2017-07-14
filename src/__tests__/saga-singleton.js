/* global test, expect, beforeEach */
import { kea } from '../logic/kea'
import { clearActionCache } from '../logic/actions'
import { keaReducer, keaSaga, clearStore } from '../scene/store'

import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { put } from 'redux-saga/effects'

import { PropTypes } from 'react'

beforeEach(() => {
  clearActionCache()
  clearStore()
})

test('can have a kea with only a saga', () => {
  let sagaRan = false

  // must run keaReducer at first so there is a point where to mount the keas
  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const sagaLogic = kea({
    start: function * () {
      expect(this.get).not.toBeDefined()
      expect(this.fetch).not.toBeDefined()
      sagaRan = true
    }
  })

  expect(sagaLogic._isKeaSingleton).toBe(true)
  expect(sagaLogic._hasKeaConnect).toBe(false)
  expect(sagaLogic._hasKeaLogic).toBe(false)
  expect(sagaLogic._hasKeaSaga).toBe(true)

  expect(sagaLogic.saga).toBeDefined()

  expect(sagaRan).toBe(false)

  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)
  finalCreateStore(reducers)

  sagaMiddleware.run(sagaLogic.saga)

  expect(sagaRan).toBe(true)
})

test('can access defined actions', () => {
  let sagaRan = false

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const sagaLogic = kea({
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

  expect(sagaLogic._isKeaSingleton).toBe(true)
  expect(sagaLogic._hasKeaConnect).toBe(false)
  expect(sagaLogic._hasKeaLogic).toBe(true)
  expect(sagaLogic._hasKeaSaga).toBe(true)

  expect(sagaLogic.saga).toBeDefined()

  expect(sagaRan).toBe(false)

  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)
  finalCreateStore(reducers)

  sagaMiddleware.run(sagaLogic.saga)

  expect(sagaRan).toBe(true)
})

test('takeEvery and takeLatest work', () => {
  let sagaRan = false
  let everyRan = false
  let latestRan = false

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const sagaLogic = kea({
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

  expect(sagaLogic._isKeaSingleton).toBe(true)
  expect(sagaLogic._hasKeaConnect).toBe(false)
  expect(sagaLogic._hasKeaLogic).toBe(true)
  expect(sagaLogic._hasKeaSaga).toBe(true)

  expect(sagaLogic.saga).toBeDefined()

  expect(sagaRan).toBe(false)

  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)

  const store = finalCreateStore(reducers)

  sagaMiddleware.run(keaSaga)
  sagaMiddleware.run(sagaLogic.saga)

  store.dispatch(sagaLogic.actions.doEvery('input-every'))
  store.dispatch(sagaLogic.actions.doLatest('input-latest'))

  expect(sagaRan).toBe(true)
  expect(everyRan).toBe(true)
  expect(latestRan).toBe(true)
})

test('can access values on reducer', () => {
  let sagaRan = false

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const sagaLogic = kea({
    actions: () => ({
      setString: (string) => ({ string })
    }),
    reducers: ({ actions }) => ({
      ourString: ['nothing', PropTypes.string, {
        [actions.setString]: (state, payload) => payload.string
      }]
    }),
    start: function * () {
      const { setString } = this.actions

      expect(this.get).toBeDefined()
      expect(this.fetch).toBeDefined()

      expect(yield this.get('ourString')).toBe('nothing')

      yield put(setString('something'))

      expect(yield this.get('ourString')).toBe('something')
      expect(yield this.fetch('ourString')).toEqual({ ourString: 'something' })

      sagaRan = true
    }
  })

  expect(sagaLogic._isKeaSingleton).toBe(true)
  expect(sagaLogic._hasKeaConnect).toBe(false)
  expect(sagaLogic._hasKeaLogic).toBe(true)
  expect(sagaLogic._hasKeaSaga).toBe(true)

  expect(sagaLogic.saga).toBeDefined()

  expect(sagaRan).toBe(false)

  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)

  finalCreateStore(reducers)

  sagaMiddleware.run(keaSaga)
  sagaMiddleware.run(sagaLogic.saga)

  expect(sagaRan).toBe(true)
})

test('runs connected sagas', () => {
  let sagaRan = false
  let connectedSagaRan = false
  let ranLast

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const connectedSagaLogic = kea({
    path: () => ['scenes', 'saga', 'connected'],
    start: function * () {
      expect(this.path).toEqual(['scenes', 'saga', 'connected'])
      connectedSagaRan = true
      ranLast = 'connected'
    }
  })

  const sagaLogic = kea({
    path: () => ['scenes', 'saga', 'base'],
    sagas: [connectedSagaLogic.saga],
    start: function * () {
      expect(this.path).toEqual(['scenes', 'saga', 'base'])
      sagaRan = true
      ranLast = 'base'
    }
  })

  expect(sagaLogic._isKeaSingleton).toBe(true)
  expect(sagaLogic._hasKeaConnect).toBe(false)
  expect(sagaLogic._hasKeaLogic).toBe(true)
  expect(sagaLogic._hasKeaSaga).toBe(true)

  expect(sagaLogic.saga).toBeDefined()

  expect(sagaRan).toBe(false)

  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)

  finalCreateStore(reducers)

  sagaMiddleware.run(keaSaga)
  sagaMiddleware.run(sagaLogic.saga)

  expect(sagaRan).toBe(true)
  expect(connectedSagaRan).toBe(true)
  expect(ranLast).toBe('base')

  // try a different way of conencting

  let otherConnectedRan = false
  sagaRan = false
  connectedSagaRan = false

  const sagaLogic2 = kea({
    connect: {
      sagas: [function * () {
        otherConnectedRan = true
      }]
    },
    sagas: [connectedSagaLogic],
    start: function * () {
      sagaRan = true
    }
  })
  sagaMiddleware.run(sagaLogic2.saga)

  expect(sagaRan).toBe(true)
  expect(connectedSagaRan).toBe(true)
  expect(otherConnectedRan).toBe(true)

  // connect without specifiying '.saga'

  sagaRan = false
  connectedSagaRan = false
  const sagaLogic3 = kea({
    sagas: [connectedSagaLogic],
    start: function * () {
      sagaRan = true
    }
  })
  sagaMiddleware.run(sagaLogic3.saga)

  expect(sagaRan).toBe(true)
  expect(connectedSagaRan).toBe(true)
})

// test sagas on component instances
