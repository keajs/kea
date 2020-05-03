/* global test, expect, beforeEach */
import { kea, resetContext, getContext, isBreakpoint } from '../index'

import PropTypes from 'prop-types'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

beforeEach(() => {
  resetContext({
    plugins: [],
    createStore: { middleware: [] }
  })
})

test('listeners work', () => {
  const { store } = getContext()

  let listenerRan = false

  const firstLogic = kea({
    path: () => ['scenes', 'listeners', 'first'],
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),
    listeners: ({ actions }) => ({
      [actions.updateName]: () => {
        listenerRan = true
      }
    })
  })

  firstLogic.mount()

  expect(getContext().plugins.activated.map(p => p.name)).toEqual(['core', 'listeners'])
  expect(firstLogic._isKea).toBe(true)
  expect(firstLogic._isKeaWithKey).toBe(false)
  expect(Object.keys(firstLogic.actions)).toEqual(['updateName'])
  expect(Object.keys(firstLogic.selectors).sort()).toEqual(['name'])

  firstLogic.actions.updateName('derpy')
  expect(firstLogic.selectors.name(store.getState())).toBe('derpy')

  expect(listenerRan).toBe(true)
})

test('listeners work with local action keys', () => {
  const { store } = getContext()

  let listenerRan = false

  const firstLogic = kea({
    path: () => ['scenes', 'listeners', 'first'],
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      name: ['chirpy', PropTypes.string, {
        updateName: (state, payload) => payload.name
      }]
    }),
    listeners: ({ actions }) => ({
      updateName: () => {
        listenerRan = true
      }
    })
  })

  firstLogic.mount()

  firstLogic.actions.updateName('derpy')
  expect(firstLogic.values.name).toBe('derpy')

  expect(listenerRan).toBe(true)
})

test('sharedListeners work', () => {
  const { store } = getContext()

  let listenerRan = false

  const firstLogic = kea({
    path: () => ['scenes', 'listeners', 'test'],
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),
    listeners: ({ actions, sharedListeners }) => ({
      [actions.updateName]: sharedListeners.doUpdateName
    }),
    sharedListeners: ({ actions }) => ({
      doUpdateName () {
        listenerRan = true
      }
    })
  })

  firstLogic.mount()

  store.dispatch(firstLogic.actions.updateName('derpy'))
  expect(firstLogic.selectors.name(store.getState())).toBe('derpy')

  expect(listenerRan).toBe(true)
})

test('many listeners for one action', () => {
  let listenerRan1 = false
  let listenerRan2 = false
  let listenerRan3 = false

  const firstLogic = kea({
    path: () => ['scenes', 'listeners', 'test'],
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),
    listeners: ({ actions, sharedListeners }) => ({
      [actions.updateName]: [
        sharedListeners.doUpdateName,
        sharedListeners.otherWorker,
        function () {
          listenerRan3 = true
        }
      ]
    }),
    sharedListeners: ({ actions }) => ({
      doUpdateName () {
        listenerRan1 = true
      },
      otherWorker () {
        listenerRan2 = true
      }
    })
  })

  firstLogic.mount()

  firstLogic.actions.updateName('derpy')
  expect(firstLogic.values.name).toBe('derpy')

  expect(listenerRan1).toBe(true)
  expect(listenerRan2).toBe(true)
  expect(listenerRan3).toBe(true)
})

test('extend works', () => {
  const { store } = getContext()

  let listenerRan1 = false
  let listenerRan2 = false

  const firstLogic = kea({
    path: () => ['scenes', 'listeners', 'test'],
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),
    listeners: ({ actions, sharedListeners }) => ({
      [actions.updateName]: () => {
        listenerRan1 = true
      }
    })
  })

  firstLogic.extend({
    listeners: ({ actions, sharedListeners }) => ({
      [actions.updateName]: () => {
        listenerRan2 = true
      }
    })
  })
  firstLogic.mount()

  store.dispatch(firstLogic.actions.updateName('derpy'))
  expect(firstLogic.values.name).toBe('derpy')

  expect(listenerRan1).toBe(true)
  expect(listenerRan2).toBe(true)
})

test('actions are bound', () => {
  let listenerRan1 = false
  let listenerRan2 = false

  const firstLogic = kea({
    path: () => ['scenes', 'listeners', 'test'],
    actions: () => ({
      updateName: name => ({ name }),
      updateOtherName: name => ({ name })
    }),
    listeners: ({ actions }) => ({
      [actions.updateName]: () => {
        actions.updateOtherName()
        listenerRan1 = true
      },
      [actions.updateOtherName]: () => {
        listenerRan2 = true
      }
    })
  })

  firstLogic.mount()
  firstLogic.actions.updateName('derpy')

  expect(listenerRan1).toBe(true)
  expect(listenerRan2).toBe(true)
})

test('store exists', () => {
  const { store } = getContext()

  let listenerRan1 = false
  let listenerRan2 = false

  const firstLogic = kea({
    path: () => ['scenes', 'listeners', 'sharedListeners2'],
    actions: () => ({
      updateName: name => ({ name }),
      updateOtherName: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      name: ['john', {
        [actions.updateName]: (_, payload) => payload.name,
        [actions.updateOtherName]: (_, payload) => payload.name
      }]
    }),
    listeners: ({ actions, actionCreators, values, selectors, store }) => ({
      [actions.updateName]: () => {
        store.dispatch(actionCreators.updateOtherName('mike'))
        expect(selectors.name(store.getState())).toBe('mike')
        expect(selectors.name()).toBe('mike')
        expect(values.name).toBe('mike')
        listenerRan1 = true
      },
      [actions.updateOtherName]: () => {
        listenerRan2 = true
      }
    })
  })

  firstLogic.mount()
  firstLogic.actions.updateName('henry')

  expect(listenerRan1).toBe(true)
  expect(listenerRan2).toBe(true)

  expect(firstLogic.selectors.name(store.getState())).toBe('mike')
  expect(firstLogic.selectors.name()).toBe('mike')
  expect(firstLogic.values.name).toBe('mike')
})

test('actions and values', () => {
  let listenerRan1 = false
  let listenerRan2 = false

  const firstLogic = kea({
    path: () => ['scenes', 'listeners', 'sharedListeners2'],
    actions: () => ({
      updateName: name => ({ name }),
      updateOtherName: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      name: ['john', {
        [actions.updateName]: (_, payload) => payload.name,
        [actions.updateOtherName]: (_, payload) => payload.name
      }]
    }),
    listeners: ({ actions, values }) => ({
      [actions.updateName]: (payload, _, action) => {
        expect(payload.name).toBe('henry')

        expect(action.payload.name).toBe('henry')
        expect(action.payload).toBe(payload)
        expect(action.type).toBe(actions.updateName.toString())

        expect(values.name).toBe('henry')

        actions.updateOtherName('mike')
        expect(values.name).toBe('mike')

        listenerRan1 = true
      },
      [actions.updateOtherName]: () => {
        listenerRan2 = true
      }
    })
  })

  firstLogic.mount()
  firstLogic.actions.updateName('henry')

  expect(firstLogic.values.name).toBe('mike')

  expect(listenerRan1).toBe(true)
  expect(listenerRan2).toBe(true)
})

test('breakpoints', async () => {
  let listenerRan0 = 0
  let listenerRan1 = 0
  let listenerRan2 = 0

  let caught = 0
  let caughtNotBreakpoint = 0

  const firstLogic = kea({
    actions: () => ({
      setUsername: username => ({ username }),
      setRepositories: repositories => ({ repositories })
    }),
    reducers: ({ actions }) => ({
      username: ['keajs', {
        [actions.setUsername]: (_, payload) => payload.username
      }],
      repositories: [[], {
        [actions.setRepositories]: (_, payload) => payload.repositories
      }]
    }),
    listeners: ({ actions, values }) => ({
      [actions.setUsername]: async function (payload, breakpoint) {
        try {
          const { setRepositories } = actions

          listenerRan0 += 1
          await breakpoint(100) // debounce for 100ms
          listenerRan1 += 1

          // simulate response
          await delay(200)
          breakpoint()

          setRepositories([1, 2, 3])

          listenerRan2 += 1
        } catch (error) {
          caught += 1
          if (isBreakpoint(error)) {
            throw error
          }
          caughtNotBreakpoint += 1
        }
      }
    })
  })

  firstLogic.mount()
  expect(firstLogic.values.repositories.length).toBe(0)
  expect(firstLogic.values.username).toBe('keajs')

  // these should trigger the "await breakpoint()"
  firstLogic.actions.setUsername('user1')
  firstLogic.actions.setUsername('user2')
  firstLogic.actions.setUsername('user3')
  firstLogic.actions.setUsername('user4')

  expect(firstLogic.values.username).toBe('user4')

  await delay(500)

  expect(listenerRan0).toBe(4)
  expect(listenerRan1).toBe(1)
  expect(listenerRan2).toBe(1)

  expect(caught).toBe(3)
  expect(caughtNotBreakpoint).toBe(0)

  expect(firstLogic.values.repositories.length).toBe(3)

  // this should trigger the breakpoint without await
  firstLogic.actions.setUsername('user1')
  await delay(200)
  firstLogic.actions.setUsername('user2')
  await delay(200)
  firstLogic.actions.setUsername('user3')

  expect(listenerRan0).toBe(7)
  expect(listenerRan1).toBe(3)
  expect(listenerRan2).toBe(1)

  await delay(500)

  expect(listenerRan0).toBe(7)
  expect(listenerRan1).toBe(4)
  expect(listenerRan2).toBe(2)

  expect(caught).toBe(5)
  expect(caughtNotBreakpoint).toBe(0)

})
