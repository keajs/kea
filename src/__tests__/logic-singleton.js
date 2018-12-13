/* global test, expect, beforeEach */
import { kea, resetKeaCache, keaReducer } from '../index'

import PropTypes from 'prop-types'

beforeEach(() => {
  resetKeaCache()
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
      ],
      upperCaseName: [
        () => [selectors.capitalizedName],
        (capitalizedName) => {
          return capitalizedName.toUpperCase()
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
  expect(Object.keys(response.reducers).sort()).toEqual(['name'])

  expect(response.reducers).toHaveProperty('name')
  expect(response.propTypes.name).toEqual(PropTypes.string)
  expect(response.defaults.name).toEqual('chirpy')

  const nameReducer = response.reducers.name
  expect(nameReducer).toBeDefined()
  expect(nameReducer('', updateName('newName'))).toBe('newName')

  // TODO: add defaults and propTypes

  expect(response.reducers).not.toHaveProperty('capitalizedName')
  expect(response.propTypes).toHaveProperty('capitalizedName', PropTypes.string)
  expect(response.defaults).not.toHaveProperty('capitalizedName', 'chirpy')

  // big reducer
  expect(typeof response.reducer).toBe('function')
  expect(response.reducer({}, { type: 'random action' })).toEqual(defaultValues)
  expect(response.reducer({ name: 'something' }, { type: 'random action' })).toEqual({ name: 'something' })
  expect(response.reducer({ name: 'something' }, updateName('newName'))).toEqual({ name: 'newName' })

  // selectors
  expect(Object.keys(response.selectors).sort()).toEqual(['capitalizedName', 'name', 'root', 'upperCaseName'])
  expect(response.selectors.name(state)).toEqual('chirpy')
  expect(response.selectors.capitalizedName(state)).toEqual('Chirpy')
  expect(response.selectors.upperCaseName(state)).toEqual('CHIRPY')

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
  expect(response.path).not.toBeDefined()
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
