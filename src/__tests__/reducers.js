/* global test, expect */
import { kea, resetContext } from '../index'

import PropTypes from 'prop-types'

test('it converts reducer arrays correctly', () => {
  resetContext()

  const reducerFunction = state => state

  const logic = kea({
    defaults: () => ({
      milk: 'not found'
    }),

    reducers: () => ({
      everything: [0, PropTypes.number, { persist: true }, { ACTION: reducerFunction }],
      noProp: [0, { persist: true }, { ACTION: reducerFunction }],
      noOptions: [0, PropTypes.number, { ACTION: reducerFunction }],
      noPropNoOptions: [0, { ACTION: reducerFunction }],
      onlyDefault: [0],
      withoutDefault: { ACTION: reducerFunction },
      justAFunction: reducerFunction
    })
  })

  logic.mount()

  expect(Object.keys(logic.reducers).sort()).toEqual(['everything', 'justAFunction', 'noOptions', 'noProp', 'noPropNoOptions', 'onlyDefault', 'withoutDefault'])
  expect(Object.keys(logic.defaults).sort()).toEqual(['everything', 'justAFunction', 'milk', 'noOptions', 'noProp', 'noPropNoOptions', 'onlyDefault', 'withoutDefault'])
  expect(Object.keys(logic.propTypes).sort()).toEqual(['everything', 'noOptions'])
  expect(Object.keys(logic.reducerOptions).sort()).toEqual(['everything', 'noProp'])

  expect(typeof logic.reducers.everything).toBe('function')
  expect(typeof logic.reducers.noProp).toBe('function')
  expect(typeof logic.reducers.noOptions).toBe('function')
  expect(typeof logic.reducers.noPropNoOptions).toBe('function')
  expect(typeof logic.reducers.onlyDefault).toBe('function')
  expect(typeof logic.reducers.withoutDefault).toBe('function')
  expect(typeof logic.reducers.justAFunction).toBe('function')

  expect(logic.defaults.everything).toBe(0)
  expect(logic.defaults.milk).toBe('not found')
  expect(logic.defaults.noProp).toBe(0)
  expect(logic.defaults.noOptions).toBe(0)
  expect(logic.defaults.noPropNoOptions).toBe(0)
  expect(logic.defaults.onlyDefault).toBe(0)
  expect(logic.defaults.withoutDefault).toBe(null)
  expect(logic.defaults.justAFunction).toBe(null)

  expect(logic.propTypes.everything).toBe(PropTypes.number)
  expect(logic.propTypes.noOptions).toBe(PropTypes.number)

  expect(logic.reducerOptions.everything).toEqual({ persist: true })
  expect(logic.reducerOptions.noProp).toEqual({ persist: true })
})

test('it auto-detects local actions from the key in reducers', () => {
  resetContext({ createStore: true })

  const logic = kea({
    actions: () => ({
      makeMagic: true,
      moreMagic: value => ({ value })
    }),

    defaults: { howMuchMagic: 0 },

    reducers: ({ actions }) => ({
      howMuchMagic: {
        makeMagic: state => state + 1,
        [actions.moreMagic]: (state, { value }) => state + value
      }
    })
  })

  logic.mount()

  expect(Object.keys(logic.reducers).sort()).toEqual(['howMuchMagic'])

  expect(logic.defaults.howMuchMagic).toEqual(0)
  expect(logic.values.howMuchMagic).toEqual(0)

  logic.actions.makeMagic()

  expect(logic.values.howMuchMagic).toEqual(1)

  logic.actions.moreMagic(100)

  expect(logic.values.howMuchMagic).toEqual(101)
})
