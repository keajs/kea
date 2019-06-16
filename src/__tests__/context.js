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
      // buildSteps: {},
      // logicFields: {},
      // events: {}
    },

    input: {
      inlinePathCreators: new Map(),
      inlinePathCounter: 0
    },

    build: {
      cache: {}
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
      debug: false,
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

    buildSteps: {
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

  expect(Object.keys(getContext().plugins.buildSteps)).toEqual(Object.keys(corePlugin.buildSteps))

  expect(getContext().plugins.buildSteps.connect).toEqual([ corePlugin.buildSteps.connect, testPlugin.buildSteps.connect ])

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

test('inlinePathCreators work as expected', () => {
  expect(getContext()).not.toBeDefined()

  openContext()
  expect(getContext()).toBeDefined()

  const { input: { inlinePathCreators } } = getContext()

  const input = {
    path: () => ['kea', 'misc', 'blue']
  }
  kea(input).build()
  expect(inlinePathCreators.get(input)).not.toBeDefined()

  const dynamicInput = {
    key: props => props.id,
    path: (key) => ['kea', 'misc', 'green', key]
  }
  kea(dynamicInput).build({ id: 12 })
  expect(inlinePathCreators.get(dynamicInput)).not.toBeDefined()

  const pathlessInput1 = {}
  kea(pathlessInput1).build()
  expect(inlinePathCreators.get(pathlessInput1)().join('.')).toBe('kea.inline.1')

  const pathlessInput2 = {}
  kea(pathlessInput2).build()
  expect(inlinePathCreators.get(pathlessInput2)().join('.')).toBe('kea.inline.2')

  const keyNoPathInput2 = { key: props => props.id }
  kea(keyNoPathInput2).build({ id: 12 })
  expect(inlinePathCreators.get(keyNoPathInput2)(12).join('.')).toBe('kea.inline.3.12')
})

