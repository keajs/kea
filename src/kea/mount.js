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

      mounted[pathString] = connectedLogic

      if (connectedLogic.reducer) {
        attachReducer(connectedLogic)
      }

      runPlugins('afterMount', pathString, connectedLogic)
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

      delete mounted[pathString]
      delete counter[pathString]

      if (connectedLogic.reducer) {
        detachReducer(connectedLogic)
      }

      runPlugins('afterUnmount', pathString, connectedLogic)

      if (typeof logic.key !== 'undefined') {
        clearBuildCache(logic.pathString)
      }
    }
  }
}

function clearBuildCache (pathString) {
  const { build: { cache } } = getContext()
  delete cache[pathString]
}