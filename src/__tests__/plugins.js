/* global test, expect, beforeEach */
import { kea, resetContext } from '../index'
import { getContext } from '../context'
import './helper/jsdom'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import corePlugin from '../core'
import { activatePlugin } from '../plugins';

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
      afterBuild (logic, input) {
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
