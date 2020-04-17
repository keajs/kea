import { createAction } from '../shared/actions'

const toSpaces = (key) => key.replace(/(?:^|\.?)([A-Z])/g, (x, y) => ' ' + y.toLowerCase()).replace(/^ /, '')

/*
  input.actions = ({ path, constants }) => ({
    setDuckId: (duckId) => ({ duckId })
  })

  ... converts to:

  logic.actionCreators == {
    setDuckId: (duckId) => ({ type: 'set duck (...)', payload: { duckId } }),
  }
*/
export function createActionCreators (logic, input) {
  if (!input.actions) {
    return
  }

  const payloadCreators = input.actions(logic)

  Object.keys(payloadCreators).forEach(key => {
    if (typeof payloadCreators[key] === 'function' && payloadCreators[key]._isKeaAction) {
      logic.actionCreators[key] = payloadCreators[key]
    } else {
      logic.actionCreators[key] = createAction(createActionType(key, logic.pathString), payloadCreators[key])
    }
  })
}

export function createActionType (key, pathString) {
  return `${toSpaces(key)} (${pathString})`
}
