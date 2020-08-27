import { createAction } from '../shared/actions'
import { Logic, LogicInput } from '../../types'

const toSpaces = (key: string) => key.replace(/(?:^|\.?)([A-Z])/g, (x, y) => ' ' + y.toLowerCase()).replace(/^ /, '')

/*
  input.actions = ({ path, constants }) => ({
    setDuckId: (duckId) => ({ duckId })
  })

  ... converts to:

  logic.actionCreators == {
    setDuckId: (duckId) => ({ type: 'set duck (...)', payload: { duckId } }),
  }
*/
export function createActionCreators(logic: Logic, input: LogicInput): void {
  if (!input.actions) {
    return
  }

  const payloadCreators = typeof input.actions === 'function' ? input.actions(logic) : input.actions

  Object.keys(payloadCreators).forEach((key) => {
    if (typeof payloadCreators[key] === 'function' && payloadCreators[key]._isKeaAction) {
      logic.actionCreators[key] = payloadCreators[key]
    } else {
      logic.actionCreators[key] = createAction(createActionType(key, logic.pathString), payloadCreators[key])
    }
  })
}

export function createActionType(key: string, pathString: string): string {
  return `${toSpaces(key)} (${pathString})`
}
