/* global test, expect, beforeEach */
import { kea, getContext, resetContext } from '../index'

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

test('building broken selectors throws a nice error', () => {
  const { store } = getContext()

  const logic = kea({
    actions: ({}) => ({
      doSomething: true
    }),
    reducers: ({ actions }) => ({
      thingie: [false, {
        [actions.doSomething]: () => true
      }]
    }),
    selectors: ({ selectors }) => ({
      anotherThing: [
        () => [selectors.thingie, selectors.notFound],
        (thingie, notFound) => 'whatever'
      ]
    })
  })

  expect(() => {
    logic.build()
  }).toThrow("[KEA] Logic \"kea.inline.1\", selector \"anotherThing\" has incorrect input: [function, undefined].")
})
  