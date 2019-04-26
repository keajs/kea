/* global test, expect, beforeEach */
import { resetKeaCache } from '../index'
import { getCache } from '../cache'

import { detachReducer, DETACH_REDUCER } from '../store/reducer'

beforeEach(() => {
  resetKeaCache()
})

test('detaches from a simple state', () => {
  const reducer = () => {}

  getCache().reducerTree = {
    scenes: { something: { 1: reducer } }
  }

  let dispatched = []

  getCache().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something', 1])

  expect(getCache().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)
})
