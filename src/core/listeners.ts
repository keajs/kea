import {
  BreakPointFunction,
  BuiltLogic,
  ListenerFunction,
  ListenerFunctionWrapper,
  Logic,
  LogicBuilder,
  LogicInput,
} from '../types'
import { getContext, getPluginContext } from '../kea/context'
import { afterMount, beforeUnmount } from './events'

export const LISTENERS_BREAKPOINT = 'kea-listeners breakpoint broke'
export const isBreakpoint = (error: Error): boolean => error.message === LISTENERS_BREAKPOINT

export type ListenersPluginContext = {
  byPath: Record<string, Record<string, ListenerFunctionWrapper[]>>
  byAction: Record<string, Record<string, ListenerFunctionWrapper[]>>
  pendingPromises: Map<Promise<void>, [BuiltLogic, string]>
}

export function listeners<L extends Logic = Logic>(input: LogicInput<L>['listeners']): LogicBuilder<L> {
  return (logic) => {
    if (!logic.listeners) {
      logic.listeners = {}
      afterMount(() => {
        addListeners(logic)
      })(logic)
      beforeUnmount(() => {
        removeListeners(logic)

        // trigger all breakpoints
        if (logic.cache.listenerBreakpointCounter) {
          for (const key of Object.keys(logic.cache.listenerBreakpointCounter)) {
            logic.cache.listenerBreakpointCounter[key] += 1
          }
        }
      })(logic)
    }

    logic.cache.listenerBreakpointCounter ??= {}

    const listeners = (typeof input === 'function' ? input(logic) : input) as Record<string, ListenerFunction>
    const { contextId } = getContext()

    for (const actionKey of Object.keys(listeners)) {
      const listenerArray: ListenerFunction[] = Array.isArray(listeners[actionKey])
        ? (listeners[actionKey] as unknown as ListenerFunction[])
        : [listeners[actionKey]]

      let key = actionKey
      if (typeof logic.actions[key] !== 'undefined') {
        key = logic.actions[key].toString()
      }

      const start = logic.listeners[key] ? logic.listeners[key].length : 0

      const listenerWrapperArray: ListenerFunctionWrapper[] = listenerArray.map(
        (listener, index): ListenerFunctionWrapper => {
          const listenerKey = `${contextId}/${key}/${start + index}`
          return (action, previousState) => {
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

export function sharedListeners<L extends Logic = Logic>(input: LogicInput<L>['sharedListeners']): LogicBuilder<L> {
  return (logic) => {
    logic.sharedListeners = {
      ...(logic.sharedListeners || {}),
      ...(typeof input === 'function' ? input(logic) : input),
    }
  }
}

function addListeners(logic: BuiltLogic) {
  const { byPath, byAction } = getPluginContext<ListenersPluginContext>('listeners')

  byPath[logic.pathString] = logic.listeners ?? {}

  for (const [key, listenerArray] of Object.entries(logic.listeners ?? {})) {
    const type = logic.actionTypes[key] ?? key
    if (!byAction[type]) {
      byAction[type] = {}
    }
    byAction[type][logic.pathString] = listenerArray
  }
}

function removeListeners(logic: BuiltLogic) {
  const { byPath, byAction } = getPluginContext<ListenersPluginContext>('listeners')

  for (const key of Object.keys(logic.listeners ?? {})) {
    const type = logic.actionTypes[key] ?? key
    if (byAction[type]) {
      delete byAction[type][logic.pathString]
      if (Object.keys(byAction[type]).length === 0) {
        delete byAction[type]
      }
    }
  }

  delete byPath[logic.pathString]
}

function trackPendingListener(logic: BuiltLogic, actionKey: string, response: Promise<void>) {
  const { pendingPromises } = getPluginContext<ListenersPluginContext>('listeners')
  pendingPromises.set(response, [logic, actionKey])
  const remove = () => {
    pendingPromises.delete(response)
  }
  response.then(remove).catch(remove)
}
