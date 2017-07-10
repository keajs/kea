/* global test, expect, beforeEach */
import { kea } from '../logic/kea'
import { clearActionCache } from '../logic/actions'
import { keaReducer, clearStore } from '../scene/store'

import { PropTypes } from 'react'

beforeEach(() => {
  clearActionCache()
  clearStore()
})

test('singleton logic has all the right properties', () => {
  keaReducer('scenes')

  const response = kea({
    path: () => ['scenes', 'homepage', 'index'],
    constants: () => [
      'SOMETHING',
      'SOMETHING_ELSE'
    ],
    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, constants }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),
    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.name],
        (name) => {
          return name.trim().split(' ').map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`).join(' ')
        },
        PropTypes.string
      ]
    })
  })

  // check generic
  expect(response._isKeaFunction).toBe(true)
  expect(response._isKeaSingleton).toBe(true)
  expect(response.path).toEqual(['scenes', 'homepage', 'index'])
  expect(response.constants).toEqual({ SOMETHING: 'SOMETHING', SOMETHING_ELSE: 'SOMETHING_ELSE' })

  // actions
  expect(Object.keys(response.actions)).toEqual(['updateName'])
  const { updateName } = response.actions
  expect(typeof updateName).toBe('function')
  expect(updateName.toString()).toBe('update name (homepage.index)')
  expect(updateName('newname')).toEqual({ payload: { name: 'newname' }, type: updateName.toString() })

  // reducers
  const defaultValues = { name: 'chirpy' }
  const state = { scenes: { homepage: { index: defaultValues } } }
  expect(Object.keys(response.reducers).sort()).toEqual(['capitalizedName', 'name'])

  expect(response.reducers).toHaveProperty('name.reducer')
  expect(response.reducers).toHaveProperty('name.type', PropTypes.string)
  expect(response.reducers).toHaveProperty('name.value', 'chirpy')

  const nameReducer = response.reducers.name.reducer
  expect(Object.keys(nameReducer)).toEqual([ updateName.toString() ])
  expect(nameReducer[updateName.toString()]).toBeDefined()
  expect(nameReducer[updateName.toString()]('', { name: 'newName' })).toBe('newName')

  expect(response.reducers).not.toHaveProperty('capitalizedName.reducer')
  expect(response.reducers).toHaveProperty('capitalizedName.type', PropTypes.string)
  expect(response.reducers).not.toHaveProperty('capitalizedName.value', 'chirpy')

  // big reducer
  expect(typeof response.reducer).toBe('function')
  expect(response.reducer({}, { type: 'random action' })).toEqual(defaultValues)
  expect(response.reducer({ name: 'something' }, { type: 'random action' })).toEqual({ name: 'something' })
  expect(response.reducer({ name: 'something' }, updateName('newName'))).toEqual({ name: 'newName' })

  // selectors
  expect(Object.keys(response.selectors).sort()).toEqual(['capitalizedName', 'name', 'root'])
  expect(response.selectors.name(state)).toEqual('chirpy')
  expect(response.selectors.capitalizedName(state)).toEqual('Chirpy')

  // root selector
  expect(response.selector(state)).toEqual(defaultValues)
  expect(response.selectors.root(state)).toEqual(defaultValues)
})

test('it is not a singleton if there is a key', () => {
  keaReducer('scenes')

  const response = kea({
    key: (props) => props.id,
    path: (key) => ['scenes', 'homepage', 'index', key],
    constants: () => [
      'SOMETHING',
      'SOMETHING_ELSE'
    ],
    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, constants }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),
    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.name],
        (name) => {
          return name.trim().split(' ').map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`).join(' ')
        },
        PropTypes.string
      ]
    })
  })

  // check generic
  expect(response._isKeaFunction).toBe(true)
  expect(response._isKeaSingleton).toBe(false)
  expect(response.path).toEqual(['scenes', 'homepage', 'index'])
  expect(response.constants).toEqual({ SOMETHING: 'SOMETHING', SOMETHING_ELSE: 'SOMETHING_ELSE' })

  // actions
  expect(Object.keys(response.actions)).toEqual(['updateName'])
  const { updateName } = response.actions
  expect(typeof updateName).toBe('function')
  expect(updateName.toString()).toBe('update name (homepage.index)')
  expect(updateName('newname')).toEqual({ payload: { name: 'newname' }, type: updateName.toString() })

  // reducers
  expect(response.reducer).not.toBeDefined()
  expect(response.reducers).not.toBeDefined()

  // selectors
  expect(response.selector).not.toBeDefined()
  expect(response.selectors).not.toBeDefined()
})
