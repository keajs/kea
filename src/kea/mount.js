import { attachReducer, detachReducer } from '../store/reducer'
import { runPlugins } from '../plugins'

import { getCache } from '../cache'

export function mountPaths (logic, plugins) {
  const { mountPathCounter, mountedLogic } = getCache()

  Object.keys(logic.connections).forEach(path => {
    mountPathCounter[path] = (mountPathCounter[path] || 0) + 1
    if (mountPathCounter[path] === 1) {
      // console.log('mounting', path)
      const connectedLogic = logic.connections[path]
      mountedLogic[path] = connectedLogic

      // attach reducer to redux if not already attached
      if (connectedLogic.reducer && !connectedLogic.mounted) {
        // console.log('attached', mountPathCounter)
        attachReducer(connectedLogic.path, connectedLogic.reducer)
        connectedLogic.mounted = true
      }

      runPlugins(plugins, 'mounted', path, connectedLogic)
    }
  })
}

export function unmountPaths (logic, plugins, lazy) {
  const { mountPathCounter, mountedLogic } = getCache()

  Object.keys(logic.connections).reverse().forEach(path => {
    mountPathCounter[path] = (mountPathCounter[path] || 0) - 1
    if (mountPathCounter[path] === 0) {
      // console.log('unmounting', path)
      const connectedLogic = logic.connections[path]
      delete mountedLogic[path]

      if (lazy && connectedLogic.reducer && connectedLogic.mounted) {
        // console.log('detached', mountPathCounter)
        detachReducer(connectedLogic.path, connectedLogic.reducer)
        connectedLogic.mounted = false
      }

      runPlugins(plugins, 'unmounted', path, connectedLogic)
    }
  })
}
