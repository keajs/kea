/* global test, expect, beforeEach */
import { resetContext } from '../index'
import { getContext } from '../context'

import { detachReducer, DETACH_REDUCER } from '../store/reducer'

beforeEach(() => {
  resetContext()
})

test('detaches from a simple state', () => {
  const reducer = () => {}

  getContext().reducerTree = {
    scenes: { something: { 1: reducer } }
  }

  let dispatched = []

  getContext().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something', 1])

  expect(getContext().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)
})

test('detaches from a state with 2 reducers', () => {
  const reducer1 = () => {}
  const reducer2 = () => {}

  getContext().reducerTree = {
    scenes: { something: { 1: reducer1, 2: reducer2 } }
  }

  let dispatched = []

  getContext().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something', 1])

  expect(getContext().reducerTree).toEqual({ scenes: { something: { 2: reducer2 } } })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)

  detachReducer(['scenes', 'something', 2])

  expect(getContext().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(2)
  expect(dispatched[1].type).toEqual(DETACH_REDUCER)
})

test('detaches from a state with 2 nested reducers, part 1', () => {
  const reducer1 = () => {}
  const reducer2 = () => {}

  getContext().reducerTree = {
    scenes: { something: { 1: reducer1, bla: { 2: reducer2 } } }
  }

  let dispatched = []

  getContext().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something', 'bla', 2])

  expect(getContext().reducerTree).toEqual({ scenes: { something: { 1: reducer1 } } })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)

  detachReducer(['scenes', 'something', 1])

  expect(getContext().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(2)
  expect(dispatched[1].type).toEqual(DETACH_REDUCER)
})

test('detaches from a state with 2 nested reducers, part 1', () => {
  const reducer1 = () => {}
  const reducer2 = () => {}

  getContext().reducerTree = {
    scenes: { something: { cat: { 1: reducer1 }, bla: { 2: reducer2 } } }
  }

  let dispatched = []

  getContext().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something', 'bla', 2])

  expect(getContext().reducerTree).toEqual({ scenes: { something: { cat: { 1: reducer1 } } } })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)

  detachReducer(['scenes', 'something', 'cat', 1])

  expect(getContext().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(2)
  expect(dispatched[1].type).toEqual(DETACH_REDUCER)
})

test('detaches from a state with a low reducer', () => {
  const reducer1 = () => {}

  getContext().reducerTree = {
    scenes: { something: reducer1 }
  }

  let dispatched = []

  getContext().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something'])

  expect(getContext().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)
})

test('cleans up a nested tree, vol 1', () => {
  const reducer1 = () => {}
  const reducer2 = () => {}

  getContext().reducerTree = {
    scenes: { something: { cat: { foo: { bar: { 1: reducer1 } } }, bla: { moo: { 2: reducer2 } } } }
  }

  let dispatched = []

  getContext().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something', 'bla', 'moo', 2])

  expect(getContext().reducerTree).toEqual({ scenes: { something: { cat: { foo: { bar: { 1: reducer1 } } } } } })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)

  detachReducer(['scenes', 'something', 'cat', 'foo', 'bar', 1])

  expect(getContext().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(2)
  expect(dispatched[1].type).toEqual(DETACH_REDUCER)
})

test('cleans up a nested tree, vol 2', () => {
  const reducer1 = () => {}
  const reducer2 = () => {}

  getContext().reducerTree = {
    scenes: { something: { cat: { foo: { bar: { 1: reducer1 } } }, bla: { moo: { 2: reducer2 } } } }
  }

  let dispatched = []

  getContext().store = {
    dispatch: (action) => dispatched.push(action)
  }

  detachReducer(['scenes', 'something', 'cat', 'foo', 'bar', 1])

  expect(getContext().reducerTree).toEqual({ scenes: { something: { bla: { moo: { 2: reducer2 } } } } })
  expect(dispatched.length).toEqual(1)
  expect(dispatched[0].type).toEqual(DETACH_REDUCER)

  detachReducer(['scenes', 'something', 'bla', 'moo', 2])

  expect(getContext().reducerTree).toEqual({ scenes: {} })
  expect(dispatched.length).toEqual(2)
  expect(dispatched[1].type).toEqual(DETACH_REDUCER)
})
