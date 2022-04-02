import {
  BreakPointFunction,
  BuiltLogic,
  CreateStoreOptions,
  KeaPlugin,
  ListenerFunction,
  ListenerFunctionWrapper,
  Logic,
  LogicBuilder,
  LogicInput,
} from '../types'
import { getContext, getPluginContext, setPluginContext } from '../kea/context'
import { MiddlewareAPI } from 'redux'
import { afterMount, beforeUnmount } from './events'

export const LISTENERS_BREAKPOINT = 'kea-listeners breakpoint broke'
export const isBreakpoint = (error: Error): boolean => error.message === LISTENERS_BREAKPOINT

type ListenersPluginContext = {
  byPath: Record<string, Record<string, ListenerFunctionWrapper[]>>
  byAction: Record<string, Record<string, ListenerFunctionWrapper[]>>
  pendingPromises: Map<Promise<void>, [BuiltLogic, string]>
}

export const listenersPlugin: KeaPlugin = {
  name: 'listeners',

  defaults: () => ({
    listeners: undefined,
    sharedListeners: undefined,
  }),

  events: {
    afterPlugin(): void {
      setPluginContext<ListenersPluginContext>('listeners', { byAction: {}, byPath: {}, pendingPromises: new Map() })
    },

    beforeReduxStore(options: CreateStoreOptions): void {
      options.middleware.push((store: MiddlewareAPI) => (next) => (action) => {
        const previousState = store.getState()
        const response = next(action)
        const { byAction } = getPluginContext<ListenersPluginContext>('listeners')
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

    legacyBuild(logic, input) {
      input.sharedListeners && sharedListeners(input.sharedListeners)(logic)
      input.listeners && listeners(input.listeners)(logic)
    },
  },
}

export function listeners<L extends Logic = Logic>(input: LogicInput['listeners']): LogicBuilder<L> {
  return (logic) => {
    if (!logic.listeners) {
      logic.listeners = {}
      afterMount(() => {
        addListenersByPathString(logic.pathString, logic.listeners)
      })(logic)
      beforeUnmount(() => {
        removeListenersByPathString(logic.pathString, logic.listeners)

        // trigger all breakpoints
        if (logic.cache.listenerBreakpointCounter) {
          for (const key of Object.keys(logic.cache.listenerBreakpointCounter)) {
            logic.cache.listenerBreakpointCounter[key] += 1
          }
        }
      })(logic)
    }

    logic.cache.listenerBreakpointCounter ??= {}

    const newListeners = (typeof input === 'function' ? input(logic) : input) as Record<string, ListenerFunction>

    const {
      contextId,
      run: { heap },
    } = getContext()

    for (const actionKey of Object.keys(newListeners)) {
      const listenerArray: ListenerFunction[] = Array.isArray(newListeners[actionKey])
        ? (newListeners[actionKey] as unknown as ListenerFunction[])
        : [newListeners[actionKey]]

      let key = actionKey
      if (typeof logic.actions[key] !== 'undefined') {
        key = logic.actions[key].toString()
      }

      const start = logic.listeners[key] ? logic.listeners[key].length : 0

      const listenerWrapperArray: ListenerFunctionWrapper[] = listenerArray.map(
        (listener, index): ListenerFunctionWrapper => {
          const listenerKey = `${contextId}/${key}/${start + index}`
          return (action, previousState) => {
            heap.push({ type: 'listener', logic, action })

            const breakCounter = (logic.cache.listenerBreakpointCounter[listenerKey] || 0) + 1
            logic.cache.listenerBreakpointCounter[listenerKey] = breakCounter

            const throwIfCalled = () => {
              if (
                logic.cache.listenerBreakpointCounter[listenerKey] !== breakCounter ||
                contextId !== getContext().contextId
              ) {
                throw new Error(LISTENERS_BREAKPOINT)
              }
            }

            const breakpoint = ((ms): Promise<void> | void => {
              if (typeof ms !== 'undefined') {
                return new Promise((resolve) => setTimeout(resolve, ms)).then(() => {
                  throwIfCalled()
                })
              } else {
                throwIfCalled()
              }
            }) as BreakPointFunction

            let response: any
            try {
              response = listener(action.payload, breakpoint, action, previousState)

              if (response && response.then && typeof response.then === 'function') {
                trackPendingListener(logic, actionKey, response)
                return response.catch((e: any) => {
                  if (e.message !== LISTENERS_BREAKPOINT) {
                    throw e
                  }
                })
              }
            } catch (e: any) {
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
  }
}

export function sharedListeners<L extends Logic = Logic>(input: LogicInput['sharedListeners']): LogicBuilder<L> {
  return (logic) => {
    logic.sharedListeners = {
      ...(logic.sharedListeners || {}),
      ...(typeof input === 'function' ? input(logic) : input),
    }
  }
}

function addListenersByPathString(pathString: string, listeners: Record<string, ListenerFunctionWrapper[]>) {
  const { byPath, byAction } = getPluginContext<ListenersPluginContext>('listeners')

  byPath[pathString] = listeners

  Object.entries(listeners).forEach(([action, listener]) => {
    if (!byAction[action]) {
      byAction[action] = {}
    }
    byAction[action][pathString] = listener
  })
}

function removeListenersByPathString(pathString: string, listeners: Record<string, ListenerFunctionWrapper[]>) {
  const { byPath, byAction } = getPluginContext<ListenersPluginContext>('listeners')

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

function trackPendingListener(logic: BuiltLogic, actionKey: string, response: Promise<void>) {
  const { pendingPromises } = getPluginContext<ListenersPluginContext>('listeners')
  pendingPromises.set(response, [logic, actionKey])
  const remove = () => {
    pendingPromises.delete(response)
  }
  response.then(remove).catch(remove)
}
