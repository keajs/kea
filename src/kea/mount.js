import { attachReducer, detachReducer } from '../store/reducer'
import { runPlugins } from '../plugins'

import { getContext } from '../context'

export function mountPaths (logic, plugins) {
  const { mount: { counter, mounted } } = getContext()

  for (const pathString of Object.keys(logic.connections)) {
    counter[pathString] = (counter[pathString] || 0) + 1
    if (counter[pathString] === 1) {
      const connectedLogic = logic.connections[pathString]

      runPlugins(plugins, 'beforeMount', pathString, connectedLogic)

      mounted[pathString] = connectedLogic

      if (connectedLogic.reducer) {
        attachReducer(connectedLogic)
      }

      runPlugins(plugins, 'afterMount', pathString, connectedLogic)
    }
  }
}

export function unmountPaths (logic, plugins) {
  const { mount: { counter, mounted } } = getContext()

  for (const pathString of Object.keys(logic.connections).reverse()) {
    counter[pathString] = (counter[pathString] || 0) - 1
    if (counter[pathString] === 0) {
      const connectedLogic = logic.connections[pathString]

      runPlugins(plugins, 'beforeUnmount', pathString, connectedLogic)

      delete mounted[pathString]
      delete counter[pathString]

      if (connectedLogic.reducer) {
        detachReducer(connectedLogic)
      }

      runPlugins(plugins, 'afterUnmount', pathString, connectedLogic)
    }
  }
}
