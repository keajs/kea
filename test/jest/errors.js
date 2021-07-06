/* global test, expect, beforeEach */
import { kea, getContext, resetContext } from '../../src'

beforeEach(() => {
  resetContext({ createStore: true })
})

test('building broken selectors throws a nice error', () => {
  const { store } = getContext()

  const logic = kea({
    actions: ({}) => ({
      doSomething: true,
    }),
    reducers: ({ actions }) => ({
      thingie: [
        false,
        {
          [actions.doSomething]: () => true,
        },
      ],
    }),
    selectors: ({ selectors }) => ({
      anotherThing: [() => [selectors.thingie, selectors.notFound], (thingie, notFound) => 'whatever'],
    }),
  })

  expect(() => {
    logic.build()
  }).toThrow('[KEA] Logic "kea.logic.1", selector "anotherThing" has incorrect input: [function, undefined].')
})

test('connecting to something that does not exist gives an error', () => {
  const { store } = getContext()

  const logic = kea({})
  logic.build() // no error

  expect(() => {
    kea({
      connect: {
        values: [undefined, ['notThere']],
      },
    }).build()
  }).toThrow('[KEA] Logic "kea.logic.2" can not connect to undefined to request prop "notThere"')

  expect(() => {
    kea({
      connect: {
        values: [logic, ['notThere']],
      },
    }).build()
  }).toThrow('[KEA] Logic "kea.logic.3", connecting to prop "notThere" returns \'undefined\'')

  expect(() => {
    kea({
      connect: {
        values: ['haha', ['notThere']],
      },
    }).build()
  }).toThrow('[KEA] Logic "kea.logic.4" can not connect to string to request prop "notThere"')

  expect(() => {
    kea({
      connect: {
        actions: [undefined, ['notThere']],
      },
    }).build()
  }).toThrow('[KEA] Logic "kea.logic.5" can not connect to undefined to request action "notThere"')

  expect(() => {
    kea({
      connect: {
        actions: [logic, ['notThere']],
      },
    }).build()
  }).toThrow('[KEA] Logic "kea.logic.6", connecting to action "notThere" returns \'undefined\'')

  expect(() => {
    kea({
      connect: {
        actions: ['haha', ['notThere']],
      },
    }).build()
  }).toThrow('[KEA] Logic "kea.logic.7" can not connect to string to request action "notThere"')
})

test('reducers with undefined actions throw', () => {
  const logic = kea({
    actions: () => ({
      doSomething: true,
    }),
    reducers: ({ actions }) => ({
      thingie: [
        false,
        {
          [actions.doSomething]: () => true,
          [actions.nope]: () => false,
        },
      ],
    }),
  })

  expect(() => {
    logic.build()
  }).toThrow(
    '[KEA] Logic "kea.logic.1" reducer "thingie" is waiting for an action that is undefined: [do something (kea.logic.1), undefined]',
  )
})

test('using actions before mounting throws', () => {
  const logic = kea({
    path: () => ['kea', 'random'],
    actions: () => ({
      doSomething: true,
    }),
    reducers: ({ actions }) => ({
      thingie: [
        false,
        {
          [actions.doSomething]: () => true,
        },
      ],
    }),
  })

  expect(() => logic.actions.doSomething()).toThrow()

  expect(() => logic.values.thingie).toThrow()

  const logic2 = kea({
    actions: () => ({
      doSomething: true,
    }),
    reducers: ({ actions }) => ({
      thingie: [
        false,
        {
          [actions.doSomething]: () => true,
        },
      ],
    }),
  })

  expect(() => logic2.actions.doSomething()).toThrow()
})

test('paths that lead nowhere throw decent errors', () => {
  const { store } = getContext()

  const logic = kea({
    path: ['scenes', 'misc', 'foo'],
    actions: {
      doSomething: true,
    },
    reducers: {
      thingie: [
        false,
        {
          doSomething: () => true,
        },
      ],
    },
  })

  const unmount = logic.mount()
  const state = store.getState()

  state.scenes = {}
  expect(() => {
    logic.values.thingie
  }).toThrow('[KEA] Can not find path "scenes.misc.foo" in the store.')

  unmount()
})
