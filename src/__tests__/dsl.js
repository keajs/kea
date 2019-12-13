/* global test, expect, beforeEach */
import { kea, getContext, resetContext } from '../index'

import { createAction } from '../core/shared/actions'
import expectExport from 'expect'

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

function addActions (actionsToAdd) {
  const logic = getContext().build.building

  Object.keys(actionsToAdd).forEach(key => {
    if (typeof actionsToAdd[key] === 'function' && actionsToAdd[key]._isKeaAction) {
      logic.actionCreators[key] = actionsToAdd[key]
    } else {
      logic.actionCreators[key] = createAction(createActionType(key, logic.path), actionsToAdd[key])
    }

    const action = logic.actionCreators[key]
    logic.actions[key] = (...inp) => getContext().store.dispatch(action(...inp))
    logic.actions[key].toString = () => logic.actionCreators[key].toString()
  })
}

const toSpaces = (key) => key.replace(/(?:^|\.?)([A-Z])/g, (x, y) => ' ' + y.toLowerCase()).replace(/^ /, '')

export function createActionType (key, path) {
  // remove 'scenes.' from the path
  const pathString = (path[0] === 'scenes' ? path.slice(1) : path).join('.')
  return `${toSpaces(key)} (${pathString})`
}

function addReducers (reducersToAdd) {
  const logic = getContext().build.building

  // TODO
}

function addSelectors (selectorsToAdd) {
  const logic = getContext().build.building

  // TODO
}

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

  expect(Object.keys(builtLogic.actions)).toEqual(Object.keys(builtNormalLogic.actions))
  expect(Object.keys(builtLogic.actions)).toEqual(['doSomething'])

  expect(Object.keys(builtLogic.actionCreators)).toEqual(Object.keys(builtNormalLogic.actionCreators))
  expect(Object.keys(builtLogic.actionCreators)).toEqual(['doSomething'])
})
