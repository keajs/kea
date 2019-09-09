import { attachReducer, detachReducer } from '../store/reducer'
import { runPlugins } from '../plugins'

import { getContext } from '../context'

export function mountLogic (logic) {
  const { mount: { counter, mounted } } = getContext()

  for (const pathString of Object.keys(logic.connections)) {
    counter[pathString] = (counter[pathString] || 0) + 1
    if (counter[pathString] === 1) {
      const connectedLogic = logic.connections[pathString]

      runPlugins('beforeMount', pathString, connectedLogic)
      logic.events && logic.events.beforeMount && logic.events.beforeMount()

      mounted[pathString] = connectedLogic

      if (connectedLogic.reducer) {
        attachReducer(connectedLogic)
      }

      runPlugins('afterMount', pathString, connectedLogic)
      logic.events && logic.events.afterMount && logic.events.afterMount()
    }
  }
}

export function unmountLogic (logic) {
  const { mount: { counter, mounted } } = getContext()

  for (const pathString of Object.keys(logic.connections).reverse()) {
    counter[pathString] = (counter[pathString] || 0) - 1
    if (counter[pathString] === 0) {
      const connectedLogic = logic.connections[pathString]

      runPlugins('beforeUnmount', pathString, connectedLogic)
      logic.events && logic.events.beforeUnmount && logic.events.beforeUnmount()

      delete mounted[pathString]
      delete counter[pathString]

      if (connectedLogic.reducer) {
        detachReducer(connectedLogic)
      }

      runPlugins('afterUnmount', pathString, connectedLogic)
      logic.events && logic.events.afterUnmount && logic.events.afterUnmount()

      clearBuildCache(pathString)
    }
  }
}

function clearBuildCache (pathString) {
  const { build: { cache } } = getContext()
  delete cache[pathString]
}
