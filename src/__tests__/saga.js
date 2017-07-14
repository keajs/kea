/* global test, expect, beforeEach */
import { kea } from '../logic/kea'
import { clearActionCache } from '../logic/actions'
import { keaReducer, clearStore } from '../scene/store'

import { PropTypes } from 'react'

beforeEach(() => {
  clearActionCache()
  clearStore()
})

test('can have a kea with only sagas', () => {
  const scenesReducer = keaReducer('scenes')

  const firstLogic = kea({
    start: function * () {
      console.log('hello')
    }
  })
  expect(firstLogic._isKeaSingleton).toBe(true)
  expect(firstLogic._hasKeaConnect).toBe(false)
  expect(firstLogic._hasKeaLogic).toBe(false)
  expect(firstLogic._hasKeaSaga).toBe(true)

  console.log(firstLogic)

  expect(firstLogic.saga).toBeDefined()
})
