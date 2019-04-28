/* global test, expect, beforeEach */
import { kea, resetKeaCache } from '../index'
import { getCache } from '../cache'
import './helper/jsdom'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import corePlugin from '../core'
import { activatePlugin } from '../plugins';

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetKeaCache()
})

test('the core plugin is activated automatically', () => {
  const { plugins, steps } = getCache()

  expect(plugins).toEqual([corePlugin])
  expect(Object.keys(steps)).toEqual(Object.keys(corePlugin.steps))
})

test('plugins add stpes', () => {
  const { plugins, steps } = getCache()

  const testPlugin = {
    name: 'test',

    defaults: () => ({
      ranAfterConnect: false
    }),

    steps: {
      connect (logic, input) {
        logic.ranAfterConnect = true
      }
    }
  }

  activatePlugin(testPlugin)

  expect(plugins).toEqual([corePlugin, testPlugin])
  expect(Object.keys(steps)).toEqual(Object.keys(corePlugin.steps))

  expect(steps.connect).toEqual([ corePlugin.steps.connect, testPlugin.steps.connect ])

  const logic = kea({})

  expect(logic.ranAfterConnect).toEqual(true)
})
