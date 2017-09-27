/* global test, expect, beforeEach */
import { kea, resetKeaCache, keaSaga, keaReducer } from '../index'

import { PropTypes } from 'prop-types'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { put, take } from 'redux-saga/effects'

import getStore from './helper/get-store'

beforeEach(() => {
  resetKeaCache()
})

test('can run sagas connected via { sagas: [] }', () => {
  const { sagaMiddleware } = getStore()

  let sagaRan = false
  let connectedSagaRan = false
  let ranLast

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
  expect(sagaLogic._keaPlugins.saga).toBe(true)

  expect(sagaLogic.saga).toBeDefined()

  sagaMiddleware.run(sagaLogic.saga)

  expect(sagaRan).toBe(true)
  expect(connectedSagaRan).toBe(true)
  expect(ranLast).toBe('base')
})

test('connect when passing the entire logic to sagas: []', () => {
  const { sagaMiddleware } = getStore()

  let otherConnectedRan = false
  let sagaRan = false
  let connectedSagaRan = false

  const connectedSagaLogic = kea({
    path: () => ['scenes', 'saga', 'connected'],
    start: function * () {
      expect(this.path).toEqual(['scenes', 'saga', 'connected'])
      connectedSagaRan = true
    }
  })

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
})

test('connect without specifiying .saga', () => {
  const { sagaMiddleware } = getStore()

  let sagaRan = false
  let connectedSagaRan = false

  const connectedSagaLogic = kea({
    path: () => ['scenes', 'saga', 'connected'],
    start: function * () {
      expect(this.path).toEqual(['scenes', 'saga', 'connected'])
      connectedSagaRan = true
    }
  })

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

test('sagas get connected actions', () => {
  let sagaRan = false
  let connectedSagaRan = false

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const connectedSagaLogic = kea({
    path: () => ['scenes', 'saga', 'connected'],
    actions: () => ({
      randomAction: true
    }),
    start: function * () {
      expect(this.path).toEqual(['scenes', 'saga', 'connected'])
      expect(Object.keys(this.actions)).toEqual(['randomAction'])
      connectedSagaRan = true
    }
  })

  const sagaLogic = kea({
    connect: {
      actions: [
        connectedSagaLogic, [
          'randomAction'
        ]
      ],
      sagas: [
        connectedSagaLogic
      ]
    },
    path: () => ['scenes', 'saga', 'base'],
    actions: () => ({
      myAction: true
    }),
    start: function * () {
      expect(this.path).toEqual(['scenes', 'saga', 'base'])
      expect(Object.keys(this.actions).sort()).toEqual(['myAction', 'randomAction'])
      sagaRan = true
    }
  })

  expect(sagaLogic._isKeaSingleton).toBe(true)
  expect(sagaLogic._hasKeaConnect).toBe(true)
  expect(sagaLogic._hasKeaLogic).toBe(true)
  expect(sagaLogic._keaPlugins.saga).toBe(true)

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
})

test('can get/fetch data from connected kea logic stores', () => {
  let sagaRan = false
  let connectedSagaRan = false

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const connectedSagaLogic = kea({
    path: () => ['scenes', 'saga', 'connected'],
    actions: () => ({
      updateValue: (number) => ({ number })
    }),
    reducers: ({ actions }) => ({
      connectedValue: [0, PropTypes.number, {
        [actions.updateValue]: (_, payload) => payload.number
      }]
    }),
    start: function * () {
      const { updateValue } = this.actions
      yield take(updateValue().toString)

      expect(yield this.get('connectedValue')).toBe(4)

      connectedSagaRan = true
    }
  })

  const sagaLogic = kea({
    connect: {
      actions: [
        connectedSagaLogic, [
          'updateValue'
        ]
      ],
      props: [
        connectedSagaLogic, [
          'connectedValue'
        ]
      ],
      sagas: [
        connectedSagaLogic
      ]
    },
    path: () => ['scenes', 'saga', 'base'],
    actions: () => ({
      myAction: true
    }),
    start: function * () {
      const { updateValue, myAction } = this.actions

      expect(updateValue).toBeDefined()
      expect(myAction).toBeDefined()

      expect(yield this.get('connectedValue')).toBe(0)
      expect(yield connectedSagaLogic.get('connectedValue')).toBe(0)
      yield put(updateValue(4))
      expect(yield connectedSagaLogic.get('connectedValue')).toBe(4)
      expect(yield this.get('connectedValue')).toBe(4)

      sagaRan = true
    }
  })

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
})

test('will autorun sagas if not manually connected', () => {
  let sagaRan = false
  let connectedSagaRan = false

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)
  finalCreateStore(reducers)
  sagaMiddleware.run(keaSaga)

  const connectedSagaLogic = kea({
    actions: () => ({
      updateValue: true
    }),
    start: function * () {
      connectedSagaRan = true
    }
  })

  const sagaLogic = kea({
    connect: {
      actions: [
        connectedSagaLogic, [
          'updateValue'
        ]
      ]
    },
    actions: () => ({
      myAction: true
    }),
    start: function * () {
      sagaRan = true
    }
  })

  sagaMiddleware.run(sagaLogic.saga)

  expect(sagaRan).toBe(true)
  expect(connectedSagaRan).toBe(true)
})

test('will autorun sagas if not manually connected, even if no internal saga', () => {
  let connectedSagaRan = false

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)
  finalCreateStore(reducers)
  sagaMiddleware.run(keaSaga)

  const connectedSagaLogic = kea({
    actions: () => ({
      updateValue: true
    }),
    start: function * () {
      connectedSagaRan = true
    }
  })

  const sagaLogic = kea({
    connect: {
      actions: [
        connectedSagaLogic, [
          'updateValue'
        ]
      ]
    }
  })

  sagaMiddleware.run(sagaLogic.saga)

  expect(sagaLogic._keaPlugins.saga).toBe(true)
  expect(connectedSagaRan).toBe(true)
})

test('will not run sagas that are already running', () => {
  let sagaRan = false
  let connectedSagaRan = 0

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)
  finalCreateStore(reducers)
  sagaMiddleware.run(keaSaga)

  const connectedSagaLogic = kea({
    actions: () => ({
      updateValue: true
    }),
    start: function * () {
      connectedSagaRan += 1
    }
  })

  const sagaLogic = kea({
    connect: {
      actions: [
        connectedSagaLogic, [
          'updateValue'
        ]
      ],
      sagas: [
        connectedSagaLogic
      ]
    },
    sagas: [
      connectedSagaLogic
    ],
    actions: () => ({
      myAction: true
    }),
    start: function * () {
      sagaRan = true
    }
  })

  sagaMiddleware.run(sagaLogic.saga)

  expect(sagaRan).toBe(true)
  expect(connectedSagaRan).toBe(1)
})
