import { attachReducer, detachReducer, getStore } from '../store/reducer'

// we store mounted paths on the store so that they could easily be garbabe collected during SSR

export function mountPaths (logic, plugins) {
  const store = getStore()
  if (!store._mountedLogic) {
    clearMountedPaths()
  }

  Object.keys(logic.connections).forEach(path => {
    store._mountPathCounter[path] = (store._mountPathCounter[path] || 0) + 1
    if (store._mountPathCounter[path] === 1) {
      const connectedLogic = logic.connections[path]
      store._mountedLogic[path] = connectedLogic

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
  const store = getStore()
  if (!store._mountedLogic) {
    clearMountedPaths()
  }

  Object.keys(logic.connections).reverse().forEach(path => {
    store._mountPathCounter[path] = (store._mountPathCounter[path] || 0) - 1
    if (store._mountPathCounter[path] === 0) {
      const connectedLogic = logic.connections[path]
      delete store._mountedLogic[path]

      if (lazy && connectedLogic.reducer && connectedLogic.mounted) {
        detachReducer(connectedLogic.path, connectedLogic.reducer)
        connectedLogic.mounted = true
      }

      plugins.forEach(p => p.unmounted && p.unmounted(path, connectedLogic))
    }
  })
}

export function getMountedLogic () {
  return getStore()._mountedLogic
}

export function getMountPathCounter () {
  return getStore()._mountPathCounter
}

export function clearMountedPaths () {
  const store = getStore()
  if (store) {
    store._mountPathCounter = {}
    store._mountedLogic = {}
  }
}
