import {createAction, createActionType} from '../shared/actions'
import { Logic, LogicInput } from '../../types'

/*
  input.actions = ({ path, constants }) => ({
    setDuckId: (duckId) => ({ duckId })
  })

  ... converts to:

  logic.actionCreators == {
    setDuckId: (duckId) => ({ type: 'set duck (...)', payload: { duckId } }),
  }
*/
export function createActionCreators<L extends Logic = Logic>(logic: L, input: LogicInput): void {
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
