/* global test, expect, beforeEach */
import { kea, resetKeaCache, keaReducer } from '../index'

import { createStore, combineReducers } from 'redux'

import PropTypes from 'prop-types'

beforeEach(() => {
  resetKeaCache()
})

test('connected props and actions get passed, reducers get added to the store', () => {
  const scenesReducer = keaReducer('scenes')

  const reducerState1 = scenesReducer({}, { type: 'discard' })
  expect(reducerState1).toEqual({})

  const firstLogic = kea({
    path: () => ['scenes', 'homepage', 'first'],
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

  const reducerState2 = scenesReducer({}, { type: 'discard' })
  expect(reducerState2).toEqual({ homepage: { first: { name: 'chirpy' } } })
  expect(Object.keys(firstLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'root', 'upperCaseName'])

  const secondLogic = kea({
    path: () => ['scenes', 'homepage', 'second'],
    connect: {
      actions: [
        firstLogic, [
          'updateName'
        ]
      ],
      props: [
        firstLogic, [
          'name',
          'capitalizedName',
          'upperCaseName'
        ]
      ]
    }
  })

  expect(secondLogic._isKeaFunction).toBe(true)
  expect(secondLogic._isKeaSingleton).toBe(true)
  expect(secondLogic.path).toEqual(['scenes', 'homepage', 'second'])
  expect([...secondLogic.paths].sort()).toEqual(['scenes.homepage.first', 'scenes.homepage.second'])
  expect(Object.keys(secondLogic.actions)).toEqual(['updateName'])
  expect(Object.keys(secondLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'root', 'upperCaseName'])

  const reducerState3 = scenesReducer({}, { type: 'discard' })
  expect(reducerState3).toEqual({ homepage: { first: { name: 'chirpy' }, second: {} } })

  const thirdLogic = kea({
    path: () => ['scenes', 'homepage', 'third'],
    connect: {
      actions: [
        firstLogic, [
          'updateName'
        ]
      ],
      props: [
        firstLogic, [
          'name',
          'capitalizedName',
          'upperCaseName'
        ]
      ]
    },
    actions: ({ constants }) => ({
      updateNameAgain: name => ({ name })
    })
  })

  expect(thirdLogic._isKeaFunction).toBe(true)
  expect(thirdLogic._isKeaSingleton).toBe(true)
  expect(thirdLogic.path).toEqual(['scenes', 'homepage', 'third'])
  expect(Object.keys(thirdLogic.actions)).toEqual(['updateName', 'updateNameAgain'])
  expect(Object.keys(thirdLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'root', 'upperCaseName'])

  const reducerState4 = scenesReducer({}, { type: 'discard' })
  expect(reducerState4).toEqual({ homepage: { first: { name: 'chirpy' }, second: {}, third: {} } })

  expect(thirdLogic.selectors.capitalizedName({ scenes: reducerState4 })).toBe('Chirpy')
  expect(thirdLogic.selectors.upperCaseName({ scenes: reducerState4 })).toBe('CHIRPY')

  const fourthLogic = kea({
    connect: {
      actions: [
        firstLogic, [
          'updateName'
        ],
        thirdLogic, [
          'updateNameAgain'
        ]
      ],
      props: [
        firstLogic, [
          'name',
          'capitalizedName',
          'upperCaseName'
        ]
      ]
    }
  })

  expect(fourthLogic._isKeaFunction).toBe(true)
  expect(fourthLogic._isKeaSingleton).toBe(true)
  expect(fourthLogic.path).not.toBeDefined()
  expect(Object.keys(fourthLogic.actions)).toEqual(['updateName', 'updateNameAgain'])
  expect(Object.keys(fourthLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'upperCaseName'])

  const reducerState5 = scenesReducer({}, { type: 'discard' })
  expect(reducerState5).toEqual(reducerState4)

  expect(fourthLogic.selectors.capitalizedName({ scenes: reducerState5 })).toBe('Chirpy')
  expect(fourthLogic.selectors.upperCaseName({ scenes: reducerState5 })).toBe('CHIRPY')
})

test('connected props can be used as selectors', () => {
  const store = createStore(combineReducers({
    scenes: keaReducer('scenes')
  }))

  const firstLogic = kea({
    path: () => ['scenes', 'homepage', 'first'],
    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, constants }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    })
  })

  const secondLogic = kea({
    path: () => ['scenes', 'homepage', 'second'],
    connect: {
      props: [
        firstLogic, [
          'name'
        ]
      ]
    },
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

  expect(secondLogic._isKeaFunction).toBe(true)
  expect(secondLogic._isKeaSingleton).toBe(true)
  expect(secondLogic.path).toEqual(['scenes', 'homepage', 'second'])
  expect(Object.keys(secondLogic.actions)).toEqual([])
  expect(Object.keys(secondLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'root', 'upperCaseName'])

  store.dispatch(firstLogic.actions.updateName('derpy'))
  expect(secondLogic.selectors.capitalizedName(store.getState())).toBe('Derpy')
  expect(secondLogic.selectors.upperCaseName(store.getState())).toBe('DERPY')
})

test('can get everything with *', () => {
  const store = createStore(combineReducers({
    scenes: keaReducer('scenes')
  }))

  const firstLogic = kea({
    path: () => ['scenes', 'homepage', 'first'],
    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, constants }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    })
  })

  const secondLogic = kea({
    path: () => ['scenes', 'homepage', 'second'],
    connect: {
      props: [
        firstLogic, [
          'name',
          '* as everything'
        ]
      ]
    }
  })

  expect(secondLogic._isKeaFunction).toBe(true)
  expect(secondLogic._isKeaSingleton).toBe(true)
  expect(secondLogic.path).toEqual(['scenes', 'homepage', 'second'])
  expect(Object.keys(secondLogic.actions)).toEqual([])
  expect(Object.keys(secondLogic.selectors).sort()).toEqual(['everything', 'name', 'root'])

  store.dispatch(firstLogic.actions.updateName('derpy'))
  expect(secondLogic.selectors.everything(store.getState())).toEqual({ name: 'derpy' })
})
