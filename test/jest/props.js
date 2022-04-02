/* global test, expect, beforeEach */
import { kea, resetContext } from '../../src'

beforeEach(() => {
  resetContext()
})

describe('props', () => {
  test('always has some props object', () => {
    let listenerRan = false

    const firstLogic = kea({
      actions: () => ({
        updateName: name => ({name}),
      }),
      listeners: ({actions, props}) => ({
        [actions.updateName]: () => {
          expect(props).toEqual({})
          listenerRan = true
        },
      }),
    })

    firstLogic.mount()
    firstLogic.actions.updateName('name')

    expect(listenerRan).toBe(true)
  })

  test('always has some props object, part 2', () => {
    let listenerRan = false

    const firstLogic = kea({
      actions: () => ({
        updateName: name => ({name}),
      }),
      listeners: ({actions, props}) => ({
        [actions.updateName]: () => {
          expect(props).toEqual({})
          listenerRan = true
        },
      }),
    })

    firstLogic().mount()
    firstLogic.actions.updateName('name')

    expect(listenerRan).toBe(true)
  })
})