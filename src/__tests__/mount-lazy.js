/* global test, expect, beforeEach */
import { kea, getStore, resetKeaCache } from '../index'

import './helper/jsdom'
import PropTypes from 'prop-types'

beforeEach(() => {
  resetKeaCache()
})

test('can mount lazy stores and have them connet to redux without react', () => {
  const store = getStore()

  const logic = kea({
    options: { lazy: true },
    path: () => ['scenes', 'lazy'],
    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, constants }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),
    selectors: ({ constants, selectors }) => ({
      upperCaseName: [
        () => [selectors.capitalizedName],
        (capitalizedName) => {
          return capitalizedName.toUpperCase()
        },
        PropTypes.string
      ],
      capitalizedName: [
        () => [selectors.name],
        (name) => {
          return name.trim().split(' ').map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`).join(' ')
        },
        PropTypes.string
      ]
    })
  })

  // nothing yet in the store
  expect(store.getState()).toEqual({ kea: {}, scenes: {} })

  const unmount = logic.mount()

  expect(store.getState()).toEqual({ kea: {}, scenes: { lazy: { name: 'chirpy' } } })

  store.dispatch(logic.actions.updateName('somename'))

  expect(store.getState()).toEqual({ kea: {}, scenes: { lazy: { name: 'somename' } } })

  unmount()

  // nothing in the store after unmounting
  expect(store.getState()).toEqual({ kea: {}, scenes: {} })
})
