import { kea, props, resetContext, propsChanged, events, actions, listeners, shallowCompare } from '../../src'

describe('async actions', () => {
  beforeEach(() => {
    resetContext()
  })

  test('can wait for async actions', async () => {
    let listenerFinished = false
    let queryId = null

    const logic = kea({
      actions: () => ({
        updateName: (name) => ({ name }),
      }),
      listeners: ({ actions, props }) => ({
        updateName: async (payload, breakpoint, action) => {
          await breakpoint(100)
          queryId = action.queryId
          listenerFinished = true
        },
      }),
    })

    logic.mount()
    await logic.asyncActions.updateName('name')
    expect(listenerFinished).toBe(true)
    expect(queryId).toBe('async-1')
  })

  test('can wait for async actions with multiple logics', async () => {
    let listenersFinished = 0
    const queryIds = []

    const firstLogic = kea({
      actions: () => ({
        updateName: (name) => ({ name }),
      }),
      listeners: () => ({
        updateName: async (payload, breakpoint, action) => {
          await breakpoint(100)
          listenersFinished += 1
          queryIds.push(action.queryId)
        },
      }),
    })
    const otherLogic = kea({
      connect: { actions: [firstLogic, ['updateName']] },
      listeners: ({ actions }) => ({
        updateName: async (payload, breakpoint, action) => {
          await breakpoint(200)
          listenersFinished += 1
          queryIds.push(action.queryId)
        },
      }),
    })

    firstLogic.mount()
    otherLogic.mount()
    await firstLogic.asyncActions.updateName('name')
    expect(listenersFinished).toBe(2)
    expect(queryIds).toEqual(['async-2', 'async-2'])
  })
})
