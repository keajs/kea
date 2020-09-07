import { Logic } from '../../types'

export function addConnection(logic: Logic, otherLogic: Logic): void {
  if (!otherLogic.connections || Object.keys(otherLogic.connections).length === 0) {
    return
  }

  // already connected to all, skip checking everything individually
  if (logic.connections[otherLogic.pathString]) {
    return
  }

  Object.keys(otherLogic.connections).forEach((path) => {
    if (!logic.connections[path]) {
      logic.connections[path] = otherLogic.connections[path]
    }
  })
}
