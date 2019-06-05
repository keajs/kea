/* global test, expect, beforeEach */
import { kea } from '../index'
import './helper/jsdom'
import corePlugin from '../core'
import { activatePlugin } from '../plugins';
import { getContext, setContext, openContext, closeContext, resetContext, withContext } from '../context'
import PropTypes from 'prop-types'

beforeEach(() => {
  resetContext()
})

test('can not extend after having been built', () => {
  const logic = kea({
    actions: () => ({
      doit: true
    })
  })

  expect(Object.keys(logic.actions).sort()).toEqual(['doit'])

  expect(() => {
    logic.extend({
      actions: () => ({
        domore: true
      })
    })
  }).toThrowError('[KEA] Can not extend logic once it has been built!')
})

test('can extend actions', () => {
  const logic = kea({
    actions: () => ({
      doit: true
    })
  })

  logic.extend({
    actions: () => ({
      domore: true
    })
  })

  expect(Object.keys(logic.actions).sort()).toEqual(['doit', 'domore'])
})

test('can extend inline', () => {
  const logic = kea({
    actions: () => ({
      doit: true
    })
  }).extend({
    actions: () => ({
      domore: true
    })
  })

  expect(Object.keys(logic.actions).sort()).toEqual(['doit', 'domore'])
})

// test('can extend in plugins', () => {

// })

test('extending singleton logic merges the right properties', () => {
  const oneResponse = kea({
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
    }),
    extend: [
      {
        constants: () => [
          'SOMETHING_BLUE',
          'SOMETHING_ELSE'
        ],
        actions: ({ constants }) => ({
          updateDescription: description => ({ description })
        }),
        reducers: ({ actions, constants }) => ({
          description: ['', PropTypes.string, {
            [actions.updateDescription]: (state, payload) => payload.description
          }]
        }),
        selectors: ({ constants, selectors }) => ({
          upperCaseDescription: [
            () => [selectors.description],
            (description) => description.toUpperCase(),
            PropTypes.string
          ]
        })
      }
    ]
  })

  // check generic
  expect(oneResponse._isKeaFunction).toBe(true)
  expect(oneResponse._isKeaSingleton).toBe(true)
  expect(oneResponse.path).toEqual(['scenes', 'homepage', 'index'])
  expect(Object.keys(oneResponse.connections)).toEqual(['scenes.homepage.index'])
  expect(oneResponse.constants).toEqual({ SOMETHING: 'SOMETHING', SOMETHING_BLUE: 'SOMETHING_BLUE', SOMETHING_ELSE: 'SOMETHING_ELSE' })

  // actions
  expect(Object.keys(oneResponse.actions)).toEqual(['updateName', 'updateDescription'])
  const { updateName, updateDescription } = oneResponse.actions
  expect(typeof updateDescription).toBe('function')
  expect(updateDescription.toString()).toBe('update description (homepage.index)')
  expect(updateDescription('desc desc')).toEqual({ payload: { description: 'desc desc' }, type: updateDescription.toString() })

  // reducers
  const defaultValues = { name: 'chirpy', description: '' }
  const state = { scenes: { homepage: { index: defaultValues } } }
  expect(Object.keys(oneResponse.reducers).sort()).toEqual(['description', 'name'])

  expect(oneResponse.reducers).toHaveProperty('name')
  expect(oneResponse.reducers).toHaveProperty('description')
  expect(oneResponse.propTypes.name).toEqual(PropTypes.string)
  expect(oneResponse.defaults.name).toEqual('chirpy')

  const nameReducer = oneResponse.reducers.name
  expect(nameReducer).toBeDefined()
  expect(nameReducer('', updateName('newName'))).toBe('newName')

  // TODO: add defaults and propTypes

  expect(oneResponse.reducers).not.toHaveProperty('capitalizedName')
  expect(oneResponse.propTypes).toHaveProperty('capitalizedName', PropTypes.string)
  expect(oneResponse.defaults).not.toHaveProperty('capitalizedName', 'chirpy')

  // big reducer
  expect(typeof oneResponse.reducer).toBe('function')
  expect(oneResponse.reducer({}, { type: 'random action' })).toEqual(defaultValues)
  expect(oneResponse.reducer({ description: 'desc desc', name: 'something' }, { type: 'random action' })).toEqual({ description: 'desc desc', name: 'something' })

  expect(oneResponse.reducer({ description: 'desc desc', name: 'something' }, updateName('newName'))).toEqual({ description: 'desc desc', name: 'newName' })

  // selectors
  expect(Object.keys(oneResponse.selectors).sort()).toEqual(['capitalizedName', 'description', 'name', 'upperCaseDescription', 'upperCaseName'])
  expect(oneResponse.selectors.name(state)).toEqual('chirpy')
  expect(oneResponse.selectors.capitalizedName(state)).toEqual('Chirpy')
  expect(oneResponse.selectors.upperCaseName(state)).toEqual('CHIRPY')

  const defaultValues2 = { name: 'chirpy', description: 'tsk tsk' }
  const state2 = { scenes: { homepage: { index: defaultValues2 } } }
  expect(oneResponse.reducer({ description: 'tsk tsk', name: 'something' }, updateName('newName'))).toEqual({ description: 'tsk tsk', name: 'newName' })

  expect(oneResponse.selectors.description(state2)).toEqual('tsk tsk')
  expect(oneResponse.selectors.upperCaseDescription(state2)).toEqual('TSK TSK')

  // root selector
  expect(oneResponse.selector(state)).toEqual(defaultValues)
})
