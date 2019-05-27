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
  expect(Object.keys(plugins.logicSteps)).toEqual(Object.keys(corePlugin.logicSteps))
})

test('plugins add stpes', () => {
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

  activatePlugin(testPlugin)

  expect(plugins.activated).toEqual([corePlugin, testPlugin])
  expect(Object.keys(plugins.logicSteps)).toEqual(Object.keys(corePlugin.logicSteps))

  expect(plugins.logicSteps.connect).toEqual([ corePlugin.logicSteps.connect, testPlugin.logicSteps.connect ])

  const logic = kea({})

  expect(logic.ranAfterConnect).toEqual(true)
})
