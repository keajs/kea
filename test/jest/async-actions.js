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
    const response = await logic.asyncActions.updateName('name')
    expect(response).toBe('from1')
    expect(listenerFinished).toBe(true)
    expect(queryId).toBe(expect.any(String))
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
          return 'from1'
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
          return 'from2'
        },
      }),
    })

    firstLogic.mount()
    otherLogic.mount()
    const response = await firstLogic.asyncActions.updateName('name')
    expect(response).toBe('from1')
    expect(listenersFinished).toBe(2)
    expect(queryIds).toEqual([expect.any(String), expect.any(String)])
  })

  test('breakpoints', async () => {
    const finished = []
    let i = 0

    const logic = kea({
      actions: () => ({
        updateName: (name) => ({ name }),
      }),
      listeners: () => ({
        updateName: async (payload, breakpoint, action) => {
          i++
          await breakpoint(100)
          finished.push(action.queryId)
          return `hello-${i}`
        },
      }),
    })

    logic.mount()
    const firstPromise = logic.asyncActions.updateName('name')
    const secondPromise = logic.asyncActions.updateName('name')

    // breakpoints cause us to wait until it finally resolves
    const val1 = await firstPromise
    expect(finished).toEqual([expect.any(String)])
    const val2 = await secondPromise
    expect(finished).toEqual([expect.any(String)])
    expect(val1).toEqual('hello-2')
    expect(val2).toEqual('hello-2')
  })
})
