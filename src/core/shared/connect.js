export function hasConnectWithKey (connect) {
  if (connect && connect.props) {
    for (let i = 0; i < connect.props.length; i += 2) {
      if (connect.props[i]._isKeaWithKey) {
        return true
      }
    }
  }

  if (connect && connect.actions) {
    for (let i = 0; i < connect.actions.length; i += 2) {
      if (connect.actions[i]._isKeaWithKey) {
        return true
      }
    }
  }

  return false
}

export function addConnection (logic, otherLogic) {
  if (!otherLogic.connections || Object.keys(otherLogic.connections).length === 0) {
    return
  }

  Object.keys(otherLogic.connections).forEach(path => {
    if (!logic.connections[path]) {
      logic.connections[path] = otherLogic.connections[path]
    }
  })
}
