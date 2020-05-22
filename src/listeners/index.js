import { getContext, setPluginContext, getPluginContext } from '../context'

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
export const isBreakpoint = error => error.message === LISTENERS_BREAKPOINT

export default {
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
    listeners(logic, input) {
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

      const newListeners = input.listeners(fakeLogic)

      logic.listeners = {
        ...(logic.listeners || {}),
      }

      for (const actionKey of Object.keys(newListeners)) {
        let newArray = Array.isArray(newListeners[actionKey]) ? newListeners[actionKey] : [newListeners[actionKey]]

        let key = actionKey
        if (typeof logic.actions[key] !== 'undefined') {
          key = logic.actions[key].toString()
        }

        const start = logic.listeners[key] ? logic.listeners[key].length : 0

        newArray = newArray.map((listener, index) => {
          const listenerKey = `${key}/${start + index}`
          return function(action) {
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

            const breakpoint = ms => {
              if (typeof ms !== 'undefined') {
                return new Promise(resolve => setTimeout(resolve, ms)).then(() => {
                  throwIfCalled()
                })
              } else {
                throwIfCalled()
              }
            }

            let response
            try {
              response = listener(action.payload, breakpoint, action)

              if (response && response.then && typeof response.then === 'function') {
                return response.catch(e => {
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
        })
        if (logic.listeners[key]) {
          logic.listeners[key] = [...logic.listeners[key], ...newArray]
        } else {
          logic.listeners[key] = newArray
        }
      }
    },

    sharedListeners(logic, input) {
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
    afterPlugin() {
      setPluginContext('listeners', { byAction: {}, byPath: {} })
    },

    beforeReduxStore(options) {
      options.middleware.push(store => next => action => {
        const response = next(action)
        const { byAction } = getPluginContext('listeners')
        const listeners = byAction[action.type]
        if (listeners) {
          for (const listenerArray of Object.values(listeners)) {
            for (const innerListener of listenerArray) {
              innerListener(action)
            }
          }
        }
        return response
      })
    },

    afterMount(logic) {
      if (!logic.listeners) {
        return
      }
      addListenersByPathString(logic.pathString, logic.listeners)
    },

    beforeUnmount(logic) {
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

    beforeCloseContext() {
      setPluginContext('listeners', { byAction: {}, byPath: {} })
    },
  },
}

function addListenersByPathString(pathString, listeners) {
  const { byPath, byAction } = getPluginContext('listeners')

  byPath[pathString] = listeners

  Object.entries(listeners).forEach(([action, listener]) => {
    if (!byAction[action]) {
      byAction[action] = {}
    }
    byAction[action][pathString] = listener
  })
}

function removeListenersByPathString(pathString, listeners) {
  const { byPath, byAction } = getPluginContext('listeners')

  Object.entries(listeners).forEach(([action, listener]) => {
    delete byAction[action][pathString]
    if (Object.keys(byAction[action]).length === 0) {
      delete byAction[action]
    }
  })

  delete byPath[pathString]
}
