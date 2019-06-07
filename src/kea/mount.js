import { attachReducer, detachReducer } from '../store/reducer'
import { runPlugins } from '../plugins'

import { getContext } from '../context'

export function mountPaths (logic, plugins) {
  const { mount: { counter, mounted } } = getContext()

  for (const path of Object.keys(logic.connections)) {
    counter[path] = (counter[path] || 0) + 1
    if (counter[path] === 1) {
      // console.log('mounting', path)
      const connectedLogic = logic.connections[path]

      mounted[path] = connectedLogic

      if (connectedLogic.reducer) {
        attachReducer(connectedLogic.path, connectedLogic.reducer)
      }

      runPlugins(plugins, 'mounted', path, connectedLogic)
    }
  }
}

export function unmountPaths (logic, plugins) {
  const { mount: { counter, mounted } } = getContext()

  for (const path of Object.keys(logic.connections).reverse()) {
    counter[path] = (counter[path] || 0) - 1
    if (counter[path] === 0) {
      // console.log('unmounting', path)
      const connectedLogic = logic.connections[path]

      delete mounted[path]
      delete counter[path]

      if (connectedLogic.reducer) {
        detachReducer(connectedLogic.path, connectedLogic.reducer)
      }

      runPlugins(plugins, 'unmounted', path, connectedLogic)
    }
  }
}
