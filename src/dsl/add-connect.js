import { addConnection } from '../core/shared/connect'
import { getContext } from '../context'

export function addConnect (connect) {
  const logic = getContext().build.building
  const props = logic.props || {}

  connect.logic && connectLogic(connect.logic, props)
  connect.actions && connectActions(connect.actions, props)
  connect.values && connectValues(connect.values, props)
  connect.props && connectValues(connect.props, props)
}

export function connectLogic (otherLogic, props = {}) {
  const logic = getContext().build.building

  if (otherLogic._isKea) {
    otherLogic = otherLogic(props)
  }
  addConnection(logic, otherLogic)
}

export function connectActions (actions, props) {
  const logic = getContext().build.building

  const response = deconstructMapping(actions)

  response.forEach(([otherLogic, from, to]) => {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof otherLogic !== 'function' && typeof otherLogic !== 'object') {
        throw new Error(`[KEA] Logic "${logic.pathString}" can not connect to ${typeof otherLogic} to request action "${from}"`)
      }
    }
    if (otherLogic._isKea) {
      otherLogic = otherLogic(props)
    }
    if (otherLogic._isKeaBuild) {
      addConnection(logic, otherLogic)
      logic.actionCreators[to] = otherLogic.actionCreators[from]
    } else {
      logic.actionCreators[to] = otherLogic[from]
    }

    if (process.env.NODE_ENV !== 'production') {
      if (typeof logic.actionCreators[to] === 'undefined') {
        throw new Error(`[KEA] Logic "${logic.pathString}", connecting to action "${from}" returns 'undefined'`)
      }
    }

    // TODO: duplicate code
    const action = logic.actionCreators[to]
    logic.actions[to] = (...inp) => getContext().store.dispatch(action(...inp))
    logic.actions[to].toString = () => logic.actionCreators[to].toString()
  })
}

export function connectValues (values, props) {
  const logic = getContext().build.building
  const response = deconstructMapping(values)

  response.forEach(([otherLogic, from, to]) => {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof otherLogic !== 'function' && typeof otherLogic !== 'object') {
        throw new Error(`[KEA] Logic "${logic.pathString}" can not connect to ${typeof otherLogic} to request prop "${from}"`)
      }
    }

    if (otherLogic._isKea) {
      otherLogic = otherLogic(props)
    }
    if (otherLogic._isKeaBuild) {
      addConnection(logic, otherLogic)
      logic.selectors[to] = from === '*' ? otherLogic.selector : otherLogic.selectors[from]

      if (from !== '*' && typeof otherLogic.propTypes[from] !== 'undefined') {
        logic.propTypes[to] = otherLogic.propTypes[from]
      }
    } else {
      logic.selectors[to] = from === '*' ? otherLogic : (state, props) => otherLogic(state, props)[from]
    }

    if (process.env.NODE_ENV !== 'production') {
      if (typeof logic.selectors[to] === 'undefined') {
        throw new Error(`[KEA] Logic "${logic.pathString}", connecting to prop "${from}" returns 'undefined'`)
      }
    }
  })
}

// input: [ logic1, [ 'a', 'b as c' ], logic2, [ 'c', 'd' ] ]
// logic: [ [logic1, 'a', 'a'], [logic1, 'b', 'c'], [logic2, 'c', 'c'], [logic2, 'd', 'd'] ]
export function deconstructMapping (mapping) {
  if (mapping.length % 2 === 1) {
    console.error(`[KEA] uneven mapping given to connect:`, mapping)
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
