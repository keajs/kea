/* global test, expect, beforeEach */
import { kea } from '../index'
import './helper/jsdom'
import corePlugin from '../core'
import { activatePlugin } from '../plugins';
import { getContext, setContext, openContext, closeContext, resetContext, withContext } from '../context'

beforeEach(() => {
  closeContext()
})

test('getting and setting works', () => {
  expect(getContext()).not.toBeDefined()

  openContext()

  expect(getContext()).toBeDefined()

  expect(getContext()).toMatchObject({
    plugins: {
      activated: [
        { name: 'core' }
      ],
      // logicSteps: {},
      // logicKeys: {}
    },

    input: {
      inputs: {},
      inputIds: new Map(),
      inlinePathCreators: new Map(),
      inlinePathCounter: 0
    },

    build: {
      cache: {},
      built: {}
    },

    mount: {
      counter: {},
      mounted: {}
    },

    reducers: {
      tree: {},
      roots: {},
      combined: undefined
    },

    store: undefined,

    options: {
      autoMount: false,
      proxyFields: true,
      attachStrategy: 'dispatch',
      detachStrategy: 'dispatch'
    }    
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

  openContext({ plugins: [testPlugin] })

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

test('inputIds works as expected', () => {
  expect(getContext()).not.toBeDefined()

  openContext()
  expect(getContext()).toBeDefined()

  const { input: { inputIds } } = getContext()

  const input = {
    path: () => ['kea', 'misc', 'blue']
  }
  const logic = kea(input)
  expect(inputIds.get(input)).toBe('kea.misc.blue')

  const dynamicInput = {
    key: true,
    path: (key) => ['kea', 'misc', 'green', key]
  }
  const dynamicLogic = kea(dynamicInput)
  expect(inputIds.get(dynamicInput)).toBe('kea.misc.green.*')

  const pathlessInput1 = {}
  const pathlessLogic1 = kea(pathlessInput1)
  expect(inputIds.get(pathlessInput1)).toBe('kea.inline.1')

  const pathlessInput2 = {}
  const pathlessLogic2 = kea(pathlessInput2)
  expect(inputIds.get(pathlessInput2)).toBe('kea.inline.2')
})

