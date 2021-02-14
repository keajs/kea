import { getContext, setPluginContext, getPluginContext } from '../context'
import {
  BreakPointFunction,
  CreateStoreOptions,
  KeaPlugin,
  ListenerFunction,
  ListenerFunctionWrapper,
  Logic,
  LogicInput,
} from '../types'
import { MiddlewareAPI } from 'redux'

/* usage:
kea({
  listeners: ({ actions, values, store, sharedListeners }) => ({
    [actions.openUrl]: ({ url }, breakpoint, action) => { actions.urlOpened(url) },
    [LOCATION_CHANGE]: [
      (payload, breakpoint, action) => { store.dispatch(...) },
      sharedListeners.otherListeForTheSameAction
    ]
  })
})
*/
export const LISTENERS_BREAKPOINT = 'kea-listeners breakpoint broke'
export const isBreakpoint = (error: Error): boolean => error.message === LISTENERS_BREAKPOINT

type ListenersPluginContext = {
  byPath: Record<string, Record<string, ListenerFunctionWrapper[]>>
  byAction: Record<string, Record<string, ListenerFunctionWrapper[]>>
}

export const listenersPlugin: KeaPlugin = {
  name: 'listeners',

  defaults: () => ({
    listeners: undefined,
    sharedListeners: undefined,
  }),

  buildOrder: {
    listeners: { before: 'events' },
    sharedListeners: { before: 'listeners' },
  },

  buildSteps: {
    listeners(logic: Logic, input: LogicInput): void {
      if (!input.listeners) {
        return
      }

      logic.cache.listenerBreakpointCounter = {}

      const fakeLogic = {
        ...logic,
      }

      Object.defineProperty(fakeLogic, 'store', {
        get() {
          return getContext().store
        },
      })

      const newListeners = (typeof input.listeners === 'function'
        ? input.listeners(fakeLogic)
        : input.listeners) as Record<string, ListenerFunction>

      logic.listeners = {
        ...(logic.listeners || {}),
      }

      for (const actionKey of Object.keys(newListeners)) {
        const listenerArray: ListenerFunction[] = Array.isArray(newListeners[actionKey])
          ? ((newListeners[actionKey] as unknown) as ListenerFunction[])
          : [newListeners[actionKey]]

        let key = actionKey
        if (typeof logic.actions[key] !== 'undefined') {
          key = logic.actions[key].toString()
        }

        const start = logic.listeners[key] ? logic.listeners[key].length : 0

        const listenerWrapperArray: ListenerFunctionWrapper[] = listenerArray.map(
          (listener, index): ListenerFunctionWrapper => {
            const listenerKey = `${key}/${start + index}`
            return (action, previousState) => {
              const {
                run: { heap },
              } = getContext()

              heap.push({ type: 'listener', logic })

              const breakCounter = (fakeLogic.cache.listenerBreakpointCounter[listenerKey] || 0) + 1
              fakeLogic.cache.listenerBreakpointCounter[listenerKey] = breakCounter

              const throwIfCalled = () => {
                if (fakeLogic.cache.listenerBreakpointCounter[listenerKey] !== breakCounter) {
                  throw new Error(LISTENERS_BREAKPOINT)
                }
              }

              const breakpoint = (ms?: number): Promise<void> | void => {
                if (typeof ms !== 'undefined') {
                  return new Promise((resolve) => setTimeout(resolve, ms)).then(() => {
                    throwIfCalled()
                  })
                } else {
                  throwIfCalled()
                }
              }

              let response
              try {
                response = listener(action.payload, breakpoint as BreakPointFunction, action, previousState)

                if (response && response.then && typeof response.then === 'function') {
                  return response.catch((e) => {
                    if (e.message !== LISTENERS_BREAKPOINT) {
                      throw e
                    }
                  })
                }
              } catch (e) {
                if (e.message !== LISTENERS_BREAKPOINT) {
                  throw e
                }
              } finally {
                heap.pop()
              }

              return response
            }
          },
        )
        if (logic.listeners[key]) {
          logic.listeners[key] = [...logic.listeners[key], ...listenerWrapperArray]
        } else {
          logic.listeners[key] = listenerWrapperArray
        }
      }
    },

    sharedListeners(logic: Logic, input: LogicInput): void {
      if (!input.sharedListeners) {
        return
      }

      const fakeLogic = {
        ...logic,
      }

      Object.defineProperty(fakeLogic, 'store', {
        get() {
          return getContext().store
        },
      })

      const newSharedListeners =
        typeof input.sharedListeners === 'function' ? input.sharedListeners(fakeLogic) : input.sharedListeners

      logic.sharedListeners = {
        ...(logic.sharedListeners || {}),
        ...newSharedListeners,
      }
    },
  },

  events: {
    afterPlugin(): void {
      setPluginContext('listeners', { byAction: {}, byPath: {} } as ListenersPluginContext)
    },

    beforeReduxStore(options: CreateStoreOptions): void {
      options.middleware.push((store: MiddlewareAPI) => (next) => (action) => {
        const previousState = store.getState()
        const response = next(action)
        const { byAction } = getPluginContext('listeners') as ListenersPluginContext
        const listeners = byAction[action.type]
        if (listeners) {
          for (const listenerArray of Object.values(listeners)) {
            for (const innerListener of listenerArray) {
              innerListener(action, previousState)
            }
          }
        }
        return response
      })
    },

    afterMount(logic: Logic): void {
      if (!logic.listeners) {
        return
      }
      addListenersByPathString(logic.pathString, logic.listeners)
    },

    beforeUnmount(logic: Logic): void {
      if (!logic.listeners) {
        return
      }
      removeListenersByPathString(logic.pathString, logic.listeners)

      // trigger all breakpoints
      if (logic.cache.listenerBreakpointCounter) {
        for (const key of Object.keys(logic.cache.listenerBreakpointCounter)) {
          logic.cache.listenerBreakpointCounter[key] += 1
        }
      }
    },

    beforeCloseContext(): void {
      setPluginContext('listeners', { byAction: {}, byPath: {} } as ListenersPluginContext)
    },
  },
}

function addListenersByPathString(pathString: string, listeners: Record<string, ListenerFunctionWrapper[]>) {
  const { byPath, byAction } = getPluginContext('listeners') as ListenersPluginContext

  byPath[pathString] = listeners

  Object.entries(listeners).forEach(([action, listener]) => {
    if (!byAction[action]) {
      byAction[action] = {}
    }
    byAction[action][pathString] = listener
  })
}

function removeListenersByPathString(pathString: string, listeners: Record<string, ListenerFunctionWrapper[]>) {
  const { byPath, byAction } = getPluginContext('listeners') as ListenersPluginContext

  Object.keys(listeners).forEach((action) => {
    if (byAction[action]) {
      delete byAction[action][pathString]
      if (Object.keys(byAction[action]).length === 0) {
        delete byAction[action]
      }
    }
  })

  delete byPath[pathString]
}
