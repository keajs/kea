/* global test, expect, beforeEach */
import { kea, resetContext } from '../index'
import { activatePlugin } from '../plugins'

import './helper/jsdom'

beforeEach(() => {
  resetContext({ createStore: true })
})

test('runs before and after mount events', () => {
  let actions = []

  const testPlugin = {
    name: 'test',

    events: {
      afterLogic (logic) {
        actions.push('plugin.afterLogic')
      },
      beforeMount (_, logic) {
        actions.push('plugin.beforeMount')
      },
      afterMount (_, logic) {
        actions.push('plugin.afterMount')
      },
      beforeUnmount (_, logic) {
        actions.push('plugin.beforeUnmount')
      },
      afterUnmount (_, logic) {
        actions.push('plugin.afterUnmount')
      }
    }
  }

  activatePlugin(testPlugin)

  const logic = kea({
    path: () => ['scenes', 'events'],

    events: () => ({
      beforeMount () {
        actions.push('logic.beforeMount')
      },
      afterMount () {
        actions.push('logic.afterMount')
      },
      beforeUnmount () {
        actions.push('logic.beforeUnmount')
      },
      afterUnmount () {
        actions.push('logic.afterUnmount')
      }
    })
  })

  expect(actions).toEqual([])

  const unmount = logic.mount()

  expect(actions).toEqual([
    'plugin.afterLogic',
    'plugin.beforeMount',
    'logic.beforeMount',
    'plugin.afterMount',
    'logic.afterMount'
  ])

  unmount()

  expect(actions).toEqual([
    'plugin.afterLogic',
    'plugin.beforeMount',
    'logic.beforeMount',
    'plugin.afterMount',
    'logic.afterMount',
    'plugin.beforeUnmount',
    'logic.beforeUnmount',
    'plugin.afterUnmount',
    'logic.afterUnmount'
  ])
})
