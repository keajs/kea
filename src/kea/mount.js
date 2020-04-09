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

      runPlugins('afterMount', connectedLogic)
      connectedLogic.events.afterMount && connectedLogic.events.afterMount()
    }
  }
}

export function proxyFields (wrapper) {
  const { options: { proxyFields }, plugins: { logicFields } } = getContext()

  if (proxyFields) {
    for (const key of reservedProxiedKeys) {
      proxyFieldToLogic(wrapper, key)
    }
    for (const key of Object.keys(logicFields)) {
      proxyFieldToLogic(wrapper, key)
    }
  }
}

export function proxyFieldToLogic (wrapper, key) {
  if (!wrapper.hasOwnProperty(key)) {
    Object.defineProperty(wrapper, key, {
      get: function () {
        const { mount: { mounted }, build: { heap } } = getContext()
        const builtLogic = wrapper.build()

        // if mounted or building as a connected dependency, return the proxied value
        if (mounted[builtLogic.pathString] || heap.length > 0 || key === 'constants') {
          return builtLogic[key]
        } else {
          throw new Error(`[KEA] Can not access "${key}" on logic "${builtLogic.pathString}" because it is not mounted!`)
        }
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
