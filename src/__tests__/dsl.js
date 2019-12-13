/* global test, expect, beforeEach */
import { kea, resetContext } from '../index'

import { addActions, addReducers, addSelectors } from '../dsl'

// import './helper/jsdom'
// import React from 'react'
// import PropTypes from 'prop-types'
// import { mount, configure } from 'enzyme'
// import { Provider } from 'react-redux'
// import Adapter from 'enzyme-adapter-react-16'

// configure({ adapter: new Adapter() })

beforeEach(() => {
  resetContext({ createStore: true })
})

test('builds logic with functions', () => {
  const logic = kea(({ actions, selectors }) => {
    addActions({
      doSomething: true
    })

    addReducers({
      thingie: [false, {
        [actions.doSomething]: () => true
      }]
    })

    addSelectors({
      anotherThing: [
        () => [selectors.thingie],
        (thingie) => 'whatever'
      ]
    })
  })

  const normalLogic = kea({
    actions: () => ({
      doSomething: true
    }),
    reducers: ({ actions }) => ({
      thingie: [false, {
        [actions.doSomething]: () => true
      }]
    }),
    selectors: ({ selectors }) => ({
      anotherThing: [
        () => [selectors.thingie],
        (thingie) => 'whatever'
      ]
    })
  })

  const builtLogic = logic.build()
  const builtNormalLogic = normalLogic.build()

  const keys = ['actions', 'actionCreators', 'reducers', 'defaults', 'selectors']

  for (const key of keys) {
    expect(Object.keys(builtLogic[key])).toEqual(Object.keys(builtNormalLogic[key]))
  }
})
