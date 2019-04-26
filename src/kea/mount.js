import { attachReducer, detachReducer } from '../store/reducer'

import { getCache } from '../cache'

// we store mounted paths on the store so that they could easily be garbabe collected during SSR

export function mountPaths (logic, plugins) {
  const { mountPathCounter, mountedLogic } = getCache()

  Object.keys(logic.connections).forEach(path => {
    mountPathCounter[path] = (mountPathCounter[path] || 0) + 1
    if (mountPathCounter[path] === 1) {
      const connectedLogic = logic.connections[path]
      mountedLogic[path] = connectedLogic

      // attach reducer to redux if not already attached
      if (connectedLogic.reducer && !connectedLogic.mounted) {
        attachReducer(connectedLogic.path, connectedLogic.reducer)
        connectedLogic.mounted = true
      }

      plugins.forEach(p => p.mounted && p.mounted(path, connectedLogic))
    }
  })
}

export function unmountPaths (logic, plugins, lazy) {
  const { mountPathCounter, mountedLogic } = getCache()

  Object.keys(logic.connections).reverse().forEach(path => {
    mountPathCounter[path] = (mountPathCounter[path] || 0) - 1
    if (mountPathCounter[path] === 0) {
      const connectedLogic = logic.connections[path]
      delete mountedLogic[path]

      if (lazy && connectedLogic.reducer && connectedLogic.mounted) {
        detachReducer(connectedLogic.path, connectedLogic.reducer)
        connectedLogic.mounted = true
      }

      plugins.forEach(p => p.unmounted && p.unmounted(path, connectedLogic))
    }
  })
}
