/* global test, expect, beforeEach */
import { kea, resetContext } from '../index'
import { getContext, getPluginContext, setPluginContext } from '../context'
import './helper/jsdom'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import corePlugin from '../core'
import { activatePlugin } from '../plugins'

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetContext()
})

test('the core plugin is activated automatically', () => {
  const { plugins } = getContext()

  expect(plugins.activated).toEqual([corePlugin])
  expect(Object.keys(plugins.buildSteps)).toEqual(Object.keys(corePlugin.buildSteps))
})

test('plugins add build steps', () => {
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

  activatePlugin(testPlugin)

  expect(plugins.activated).toEqual([corePlugin, testPlugin])
  expect(Object.keys(plugins.buildSteps)).toEqual(Object.keys(corePlugin.buildSteps))

  expect(plugins.buildSteps.connect).toEqual([ corePlugin.buildSteps.connect, testPlugin.buildSteps.connect ])

  const logic = kea({})

  expect(logic.ranAfterConnect).toEqual(true)
})

test('plugins add events', () => {
  const { plugins } = getContext()

  const testPlugin = {
    name: 'test',

    defaults: () => ({
      ranAfterBuild: false
    }),

    events: {
      afterBuild (logic, inputs) {
        logic.ranAfterBuild = true
      }
    }
  }

  activatePlugin(testPlugin)

  expect(plugins.activated).toEqual([corePlugin, testPlugin])
  expect(Object.keys(plugins.events)).toEqual(['afterBuild'])

  expect(plugins.events.afterBuild).toEqual([ testPlugin.events.afterBuild ])

  const logic = kea({})
  logic.build()

  expect(logic.ranAfterBuild).toEqual(true)
})

test('function plugins work', () => {
  const { plugins } = getContext()

  const testPluginContents = {
    name: 'test',

    defaults: () => ({
      ranAfterBuild: false
    }),

    events: {
      afterBuild (logic, inputs) {
        logic.ranAfterBuild = true
      }
    }
  }
  const testPlugin = () => testPluginContents

  activatePlugin(testPlugin)

  expect(plugins.activated).toEqual([corePlugin, testPluginContents])
  expect(Object.keys(plugins.events)).toEqual(['afterBuild'])

  expect(plugins.events.afterBuild).toEqual([ testPluginContents.events.afterBuild ])

  const logic = kea({})
  logic.build()

  expect(logic.ranAfterBuild).toEqual(true)
})

test('plugin context & afterPlugin work', () => {
  const { plugins } = getContext()

  const testPlugin = {
    name: 'test',

    defaults: () => ({
      ranAfterBuild: null
    }),

    events: {
      afterPlugin () {
        setPluginContext('pluginName', { someKey: 'yesplease' })
      },

      afterBuild (logic, inputs) {
        logic.ranAfterBuild = getPluginContext('pluginName').someKey
      }
    }
  }

  activatePlugin(testPlugin)

  expect(plugins.activated).toEqual([corePlugin, testPlugin])
  expect(Object.keys(plugins.events)).toEqual(['afterPlugin', 'afterBuild'])
  expect(plugins.events.afterBuild).toEqual([ testPlugin.events.afterBuild ])

  const logic = kea({})
  logic.build()

  expect(logic.ranAfterBuild).toEqual('yesplease')
})

test('can use logic.cache to store things', () => {
  const { plugins } = getContext()

  let checkedAfterMount = false

  const testPlugin = {
    name: 'test',

    events: {
      afterLogic (logic) {
        logic.cache.whatever = true
      },
      afterMount (logic) {
        checkedAfterMount = logic.cache.whatever
      }
    }
  }

  activatePlugin(testPlugin)

  expect(plugins.activated).toEqual([corePlugin, testPlugin])
  expect(Object.keys(plugins.events)).toEqual(['afterLogic', 'afterMount'])

  const logic = kea({})
  logic.mount()

  expect(logic.cache.whatever).toEqual(true)
  expect(checkedAfterMount).toEqual(true)
})
