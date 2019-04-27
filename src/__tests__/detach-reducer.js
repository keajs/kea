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

test('detaches from a state with 2 reducers', () => {
  const reducer1 = () => {}
  const reducer2 = () => {}

  getCache().reducerTree = {
    scenes: { something: { 1: reducer1, 2: reducer2 } }
  }

  let dispatched = []

  getCache().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something', 1])

  expect(getCache().reducerTree).toEqual({ scenes: { something: { 2: reducer2 } } })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)

  detachReducer(['scenes', 'something', 2])

  expect(getCache().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(2)
  expect(dispatched[1].type).toEqual(DETACH_REDUCER)
})

test('detaches from a state with 2 nested reducers, part 1', () => {
  const reducer1 = () => {}
  const reducer2 = () => {}

  getCache().reducerTree = {
    scenes: { something: { 1: reducer1, bla: { 2: reducer2 } } }
  }

  let dispatched = []

  getCache().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something', 'bla', 2])

  expect(getCache().reducerTree).toEqual({ scenes: { something: { 1: reducer1 } } })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)

  detachReducer(['scenes', 'something', 1])

  expect(getCache().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(2)
  expect(dispatched[1].type).toEqual(DETACH_REDUCER)
})

test('detaches from a state with 2 nested reducers, part 1', () => {
  const reducer1 = () => {}
  const reducer2 = () => {}

  getCache().reducerTree = {
    scenes: { something: { cat: { 1: reducer1 }, bla: { 2: reducer2 } } }
  }

  let dispatched = []

  getCache().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something', 'bla', 2])

  expect(getCache().reducerTree).toEqual({ scenes: { something: { cat: { 1: reducer1 } } } })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)

  detachReducer(['scenes', 'something', 'cat', 1])

  expect(getCache().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(2)
  expect(dispatched[1].type).toEqual(DETACH_REDUCER)
})

test('detaches from a state with a low reducer', () => {
  const reducer1 = () => {}

  getCache().reducerTree = {
    scenes: { something: reducer1 }
  }

  let dispatched = []

  getCache().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something'])

  expect(getCache().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)
})

test('cleans up a nested tree, vol 1', () => {
  const reducer1 = () => {}
  const reducer2 = () => {}

  getCache().reducerTree = {
    scenes: { something: { cat: { foo: { bar: { 1: reducer1 } } }, bla: { moo: { 2: reducer2 } } } }
  }

  let dispatched = []

  getCache().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something', 'bla', 'moo', 2])

  expect(getCache().reducerTree).toEqual({ scenes: { something: { cat: { foo: { bar: { 1: reducer1 } } } } } })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)

  detachReducer(['scenes', 'something', 'cat', 'foo', 'bar', 1])

  expect(getCache().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(2)
  expect(dispatched[1].type).toEqual(DETACH_REDUCER)
})

test('cleans up a nested tree, vol 2', () => {
  const reducer1 = () => {}
  const reducer2 = () => {}

  getCache().reducerTree = {
    scenes: { something: { cat: { foo: { bar: { 1: reducer1 } } }, bla: { moo: { 2: reducer2 } } } }
  }

  let dispatched = []

  getCache().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something', 'cat', 'foo', 'bar', 1])

  expect(getCache().reducerTree).toEqual({ scenes: { something: { bla: { moo: { 2: reducer2 } } } } })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)

  detachReducer(['scenes', 'something', 'bla', 'moo', 2])

  expect(getCache().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(2)
  expect(dispatched[1].type).toEqual(DETACH_REDUCER)
})
