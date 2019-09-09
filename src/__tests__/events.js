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
      beforeMount (logic) {
        actions.push('plugin.beforeMount')
      },
      afterMount (logic) {
        actions.push('plugin.afterMount')
      },
      beforeUnmount (logic) {
        actions.push('plugin.beforeUnmount')
      },
      afterUnmount (logic) {
        actions.push('plugin.afterUnmount')
      }
    }
  }

  activatePlugin(testPlugin)

  const connectedLogic = kea({
    reducers: () => ({
      value: [true]
    }),
    events: () => ({
      beforeMount () {
        actions.push('connectedLogic.beforeMount')
      },
      afterMount () {
        actions.push('connectedLogic.afterMount')
      },
      beforeUnmount () {
        actions.push('connectedLogic.beforeUnmount')
      },
      afterUnmount () {
        actions.push('connectedLogic.afterUnmount')
      }
    })
  })

  const logic = kea({
    connect: {
      values: [connectedLogic, ['value']]
    },
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
    'plugin.afterLogic',

    'plugin.beforeMount',
    'connectedLogic.beforeMount',
    'plugin.afterMount',
    'connectedLogic.afterMount',

    'plugin.beforeMount',
    'logic.beforeMount',
    'plugin.afterMount',
    'logic.afterMount'
  ])

  unmount()

  expect(actions).toEqual([
    'plugin.afterLogic',
    'plugin.afterLogic',

    'plugin.beforeMount',
    'connectedLogic.beforeMount',
    'plugin.afterMount',
    'connectedLogic.afterMount',

    'plugin.beforeMount',
    'logic.beforeMount',
    'plugin.afterMount',
    'logic.afterMount',

    'plugin.beforeUnmount',
    'logic.beforeUnmount',
    'plugin.afterUnmount',
    'logic.afterUnmount',

    'plugin.beforeUnmount',
    'connectedLogic.beforeUnmount',
    'plugin.afterUnmount',
    'connectedLogic.afterUnmount'
  ])
})
