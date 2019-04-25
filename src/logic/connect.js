export function createConnect (input, logic) {
  if (!input.connect) {
    return
  }

  if (input.connect.actions) {
    const response = deconstructMapping(input.connect.actions)

    response.forEach(([otherLogic, from, to]) => {
      if (otherLogic._isKeaWithKey || otherLogic._isKeaFunction) {
        const logicToConenct = otherLogic._isKeaWithKey ? otherLogic(logic.props) : otherLogic
        addConnection(logic, logicToConenct)
        logic.actions[to] = logicToConenct.actions[from]
      } else {
        logic.actions[to] = otherLogic[from]
      }
    })
  }

  if (input.connect.props) {
    const response = deconstructMapping(input.connect.props)

    response.forEach(([otherLogic, from, to]) => {
      if (otherLogic._isKeaWithKey || otherLogic._isKeaFunction) {
        const logicToConenct = otherLogic._isKeaWithKey ? otherLogic(logic.props) : otherLogic
        addConnection(logic, logicToConenct)
        logic.selectors[to] = from === '*' ? logicToConenct.selector : logicToConenct.selectors[from]
      } else {
        logic.selectors[to] = from === '*' ? otherLogic : (state, props) => otherLogic(state, props)[from]
      }
    })
  }
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

// input: [ logic1, [ 'a', 'b as c' ], logic2, [ 'c', 'd' ] ]
// logic: [ [logic1, 'a', 'a'], [logic1, 'b', 'c'], [logic2, 'c', 'c'], [logic2, 'd', 'd'] ]
export function deconstructMapping (mapping) {
  if (mapping.length % 2 === 1) {
    console.error(`[KEA-LOGIC] uneven mapping given to connect:`, mapping)
    console.trace()
    return null
  }

  let response = []

  for (let i = 0; i < mapping.length; i += 2) {
    const logic = mapping[i]
    const array = mapping[i + 1]

    for (let j = 0; j < array.length; j++) {
      if (array[j].includes(' as ')) {
        const parts = array[j].split(' as ')
        response.push([logic, parts[0], parts[1]])
      } else {
        response.push([logic, array[j], array[j]])
      }
    }
  }

  return response
}

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
