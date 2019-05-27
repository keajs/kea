/* global test, expect, beforeEach */
import { kea } from '../index'
import './helper/jsdom'
import corePlugin from '../core'
import { activatePlugin } from '../plugins';
import { getContext, setContext, openContext, closeContext, resetContext, withContext } from '../context'

beforeEach(() => {
//   resetContext()
  closeContext()
})

test('getting and setting works', () => {
  expect(getContext()).not.toBeDefined()

  openContext()

  expect(getContext()).toBeDefined()

  expect(getContext()).toMatchObject({
    // actions
    actions: {},

    // reducers
    defaultReducerRoot: null,
    reducerTree: {},
    rootReducers: {},

    // plugins
    plugins: {
      activated: [
        { name: 'core' }
      ],
    //   logicSteps: {},
    //   logicKeys: {}
    },

    // mount
    mountPathCounter: {},
    mountedLogic: {},

    // logic
    inputPathCreators: new WeakMap(),
    globalInputCounter: 0,
    logicCache: {},

    // store
    store: undefined
  })

  closeContext()

  expect(getContext()).not.toBeDefined()
})

test('context works with plugins', () => {
  expect(getContext()).not.toBeDefined()

  openContext()
 
  expect(getContext()).toBeDefined()

  const { plugins } = getContext()

  const testPlugin = {
    name: 'test',

    defaults: () => ({
      ranAfterConnect: false
    }),

    logicSteps: {
      connect (logic, input) {
        logic.ranAfterConnect = true
      }
    }
  }

  expect(getContext()).toMatchObject({
    plugins: {
      activated: [
        { name: 'core' }
      ]
    }
  })

  activatePlugin(testPlugin)

  expect(getContext()).toMatchObject({
    plugins: {
      activated: [
        { name: 'core' },
        { name: 'test' }
      ]
    }
  })

  expect(Object.keys(getContext().plugins.logicSteps)).toEqual(Object.keys(corePlugin.logicSteps))

  expect(getContext().plugins.logicSteps.connect).toEqual([ corePlugin.logicSteps.connect, testPlugin.logicSteps.connect ])

  // const logic = kea({ options:{lazy:true}})
  const logic = kea({})

  expect(logic.ranAfterConnect).toEqual(true)

  closeContext()
  expect(getContext()).not.toBeDefined()

  openContext({}, [testPlugin])
 
  expect(getContext()).toBeDefined()
  expect(getContext()).toMatchObject({
    plugins: {
      activated: [
        { name: 'core' },
        { name: 'test' }
      ]
    }
  })

})
