import { attachReducer, detachReducer } from '../store/reducer'
import { runPlugins } from '../plugins'

import { getContext } from '../context'
import { Logic } from '../types'

export function mountLogic(logic: Logic, count = 1): void {
  const {
    mount: { counter, mounted },
  } = getContext()

  // mount this logic after all the dependencies
  const pathStrings = Object.keys(logic.connections)
    .filter((k) => k !== logic.pathString)
    .concat([logic.pathString])

  for (const pathString of pathStrings) {
    counter[pathString] = (counter[pathString] || 0) + count
    if (counter[pathString] === count) {
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

function clearBuildCache(pathString: string): void {
  const {
    build: { cache },
  } = getContext()
  delete cache[pathString]
}

export function unmountLogic(logic: Logic): void {
  const {
    mount: { counter, mounted },
  } = getContext()

  // unmount in reverse order
  const pathStrings = Object.keys(logic.connections)
    .filter((k) => k !== logic.pathString)
    .concat([logic.pathString])
    .reverse()

  for (const pathString of pathStrings) {
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
