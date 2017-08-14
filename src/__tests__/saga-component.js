/* global test, expect, beforeEach */
import { kea } from '../kea'
import { clearActionCache } from '../logic/actions'
import { keaSaga, keaReducer, clearStore } from '../scene/store'

import './helper/jsdom'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { mount } from 'enzyme'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { put } from 'redux-saga/effects'

beforeEach(() => {
  clearActionCache()
  clearStore()
})

function getStore () {
  clearActionCache()
  clearStore()

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)

  const store = finalCreateStore(reducers)

  sagaMiddleware.run(keaSaga)

  return store
}

class SampleComponent extends Component {
  render () {
    return (
      <div>
        bla bla ble
      </div>
    )
  }
}

test('the saga starts and stops with the component', () => {
  const store = getStore()

  let sagaStarted = false

  const logicWithSaga = kea({
    * start () {
      expect(this.props.id).toBe(12)
      sagaStarted = true
    }
  })

  expect(sagaStarted).toBe(false)

  const ConnectedComponent = logicWithSaga(SampleComponent)

  mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  )

  expect(sagaStarted).toBe(true)
})

test('the actions get a key', () => {
  const store = getStore()

  let sagaStarted = false
  let takeEveryRan = false

  const getActionsFromHere = kea({
    actions: () => ({
      something: true
    })
  })

  const logicWithSaga = kea({
    connect: {
      actions: [
        getActionsFromHere, [
          'something'
        ]
      ]
    },

    key: (props) => props.id,

    path: (key) => ['scenes', 'sagaProps', key],

    actions: () => ({
      myAction: (value) => ({ value })
    }),

    reducers: ({ actions }) => ({
      someData: ['nothing', PropTypes.string, {
        [actions.myAction]: (state, payload) => payload.value
      }]
    }),

    * start () {
      expect(this.key).toBe(12)
      expect(this.props.id).toBe(12)
      expect(this.path).toEqual(['scenes', 'sagaProps', 12])
      expect(Object.keys(this.actions)).toEqual(['something', 'myAction'])

      const { myAction } = this.actions
      expect(myAction('something')).toEqual({ type: myAction.toString(), payload: { key: 12, value: 'something' } })

      expect(yield this.get('someData')).toEqual('nothing')
      yield put(myAction('something'))

      expect(yield this.get('someData')).toEqual('something')

      sagaStarted = true
    },

    takeEvery: ({ actions, workers }) => ({
      [actions.myAction]: workers.doStuff
    }),

    workers: {
      * doStuff (action) {
        const { value } = action.payload
        expect(value).toBe('something')

        // should already be in the store
        expect(yield this.get('someData')).toBe('something')

        takeEveryRan = true
      }
    }
  })

  expect(sagaStarted).toBe(false)

  const ConnectedComponent = logicWithSaga(SampleComponent)

  mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  )

  expect(sagaStarted).toBe(true)
  expect(takeEveryRan).toBe(true)
})
