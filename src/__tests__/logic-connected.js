/* global test, expect, beforeEach */
import { kea, resetContext, keaReducer, getContext } from '../index'

import { createStore, combineReducers } from 'redux'

import PropTypes from 'prop-types'

beforeEach(() => {
  resetContext({ autoMount: true, createStore: true })
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
  expect(Object.keys(firstLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'upperCaseName'])

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

  expect(secondLogic._isKea).toBe(true)
  expect(secondLogic._isKeaWithKey).toBe(false)
  expect(secondLogic.path).toEqual(['scenes', 'homepage', 'second'])
  expect(Object.keys(secondLogic.connections).sort()).toEqual(['scenes.homepage.first', 'scenes.homepage.second'])
  expect(Object.keys(secondLogic.actions)).toEqual(['updateName'])
  expect(Object.keys(secondLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'upperCaseName'])

  const reducerState3 = scenesReducer({}, { type: 'discard' })
  expect(reducerState3).toEqual({ homepage: { first: { name: 'chirpy' } } })

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

  expect(thirdLogic._isKea).toBe(true)
  expect(thirdLogic._isKeaWithKey).toBe(false)
  expect(thirdLogic.path).toEqual(['scenes', 'homepage', 'third'])
  expect(Object.keys(thirdLogic.actions)).toEqual(['updateName', 'updateNameAgain'])
  expect(Object.keys(thirdLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'upperCaseName'])

  const reducerState4 = scenesReducer({}, { type: 'discard' })
  expect(reducerState4).toEqual({ homepage: { first: { name: 'chirpy' } } })

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

  expect(fourthLogic._isKea).toBe(true)
  expect(fourthLogic._isKeaWithKey).toBe(false)
  expect(fourthLogic.path).toBeDefined()
  expect(Object.keys(fourthLogic.actions)).toEqual(['updateName', 'updateNameAgain'])
  expect(Object.keys(fourthLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'upperCaseName'])

  const reducerState5 = scenesReducer({}, { type: 'discard' })
  expect(reducerState5).toEqual(reducerState4)

  expect(fourthLogic.selectors.capitalizedName({ scenes: reducerState5 })).toBe('Chirpy')
  expect(fourthLogic.selectors.upperCaseName({ scenes: reducerState5 })).toBe('CHIRPY')
})

test('connected props can be used as selectors', () => {
  const { store } = getContext()

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

  expect(secondLogic._isKea).toBe(true)
  expect(secondLogic._isKeaWithKey).toBe(false)
  expect(secondLogic.path).toEqual(['scenes', 'homepage', 'second'])
  expect(Object.keys(secondLogic.actions)).toEqual([])
  expect(Object.keys(secondLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'upperCaseName'])

  firstLogic.actions.updateName('derpy')

  expect(secondLogic.selectors.capitalizedName(store.getState())).toBe('Derpy')
  expect(secondLogic.selectors.upperCaseName(store.getState())).toBe('DERPY')
  expect(secondLogic.values.capitalizedName).toBe('Derpy')
  expect(secondLogic.values.upperCaseName).toBe('DERPY')
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

  expect(secondLogic._isKea).toBe(true)
  expect(secondLogic._isKeaWithKey).toBe(false)
  expect(secondLogic.path).toEqual(['scenes', 'homepage', 'second'])
  expect(Object.keys(secondLogic.actions)).toEqual([])
  expect(Object.keys(secondLogic.selectors).sort()).toEqual(['everything', 'name'])

  firstLogic.actions.updateName('derpy')
  expect(secondLogic.values.everything).toEqual({ name: 'derpy' })
})

test('have it in the store only if there is a reducer', () => {
  const store = createStore(combineReducers({
    scenes: keaReducer('scenes')
  }))

  kea({
    path: () => ['scenes', 'homepage', 'full'],
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),
    selectors: ({ selectors }) => ({
      capitalizedName: [
        () => [selectors.name],
        (name) => {
          return name.trim().split(' ').map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`).join(' ')
        },
        PropTypes.string
      ]
    })
  })

  const logic2 = kea({
    path: (key) => ['scenes', 'homepage', 'reducer'],
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    })
  })

  kea({
    path: (key) => ['scenes', 'homepage', 'selectors'],
    actions: () => ({
      updateName: name => ({ name })
    }),
    selectors: ({ selectors }) => ({
      capitalizedName: [
        () => [logic2.selectors.name],
        (name) => {
          return name.trim().split(' ').map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`).join(' ')
        },
        PropTypes.string
      ]
    })
  })

  kea({
    path: (key) => ['scenes', 'homepage', 'actions'],
    actions: () => ({
      updateName: name => ({ name })
    })
  })

  kea({
    path: (key) => ['scenes', 'homepage', 'connect'],
    connect: {
      props: [
        logic2, ['name']
      ]
    }
  })

  kea({
    path: (key) => ['scenes', 'homepage', 'connectActions'],
    connect: {
      props: [
        logic2, ['name']
      ]
    },
    actions: () => ({
      updateName: name => ({ name })
    })
  })

  kea({
    path: (key) => ['scenes', 'homepage', 'connectReducer'],
    connect: {
      props: [
        logic2, ['name']
      ]
    },
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    })
  })

  kea({
    path: (key) => ['scenes', 'homepage', 'connectSelector'],
    connect: {
      props: [
        logic2, ['name']
      ]
    },
    selectors: ({ selectors }) => ({
      capitalizedName: [
        () => [selectors.name],
        (name) => {
          return name.trim().split(' ').map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`).join(' ')
        },
        PropTypes.string
      ]
    })
  })

  store.dispatch({ type: 'bla' })

  expect(Object.keys(store.getState().scenes.homepage).sort()).toEqual(['connectReducer', 'full', 'reducer'])
})
