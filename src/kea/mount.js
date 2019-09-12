import { attachReducer, detachReducer } from '../store/reducer'
import { runPlugins, reservedProxiedKeys } from '../plugins'

import { getContext } from '../context'

export function mountLogic (logic) {
  const { mount: { counter, mounted } } = getContext()

  for (const pathString of Object.keys(logic.connections)) {
    counter[pathString] = (counter[pathString] || 0) + 1
    if (counter[pathString] === 1) {
      const connectedLogic = logic.connections[pathString]

      runPlugins('beforeMount', connectedLogic)
      connectedLogic.events.beforeMount && connectedLogic.events.beforeMount()

      mounted[pathString] = connectedLogic

      if (connectedLogic.reducer) {
        attachReducer(connectedLogic)
      }

      proxyFields(connectedLogic)

      runPlugins('afterMount', connectedLogic)
      connectedLogic.events.afterMount && connectedLogic.events.afterMount()
    }
  }
}

function proxyFields (logic) {
  const { options: { proxyFields }, plugins: { logicFields } } = getContext()

  if (proxyFields) {
    for (const key of reservedProxiedKeys) {
      proxyFieldToLogic(logic.wrapper, key)
    }
    for (const key of Object.keys(logicFields)) {
      proxyFieldToLogic(logic.wrapper, key)
    }
  }
}

export function proxyFieldToLogic (wrapper, key) {
  if (!wrapper.hasOwnProperty(key)) {
    Object.defineProperty(wrapper, key, {
      get: function () {
        return wrapper.build()[key]
      }
    })
  }
}

export function unmountLogic (logic) {
  const { mount: { counter, mounted } } = getContext()

  for (const pathString of Object.keys(logic.connections).reverse()) {
    counter[pathString] = (counter[pathString] || 0) - 1
    if (counter[pathString] === 0) {
      const connectedLogic = logic.connections[pathString]

      runPlugins('beforeUnmount', connectedLogic)
      connectedLogic.events.beforeUnmount && connectedLogic.events.beforeUnmount()

      delete mounted[pathString]
      delete counter[pathString]

      if (connectedLogic.reducer) {
        detachReducer(connectedLogic)
      }

      runPlugins('afterUnmount', connectedLogic)
      connectedLogic.events.afterUnmount && connectedLogic.events.afterUnmount()

      clearBuildCache(pathString)
    }
  }
}

function clearBuildCache (pathString) {
  const { build: { cache } } = getContext()
  delete cache[pathString]
}
