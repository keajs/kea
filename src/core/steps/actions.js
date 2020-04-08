import { getContext } from '../../context'

/*
  logic.actionCreators == {
    setDuckId: (duckId) => ({ type: 'set duck (...)', payload: { duckId } }),
  }

  ... converts to:

  logic.actions = {
    setDuckId: (duckId) => dispatch(logic.actionCreators.setDuckId(duckId))
  }
*/

export function createActions (logic, input) {
  Object.keys(logic.actionCreators).forEach(key => {
    const action = logic.actionCreators[key]
    const string = action.toString()
    logic.actions[key] = (...inp) => getContext().store.dispatch(action(...inp))
    logic.actions[key].toString = () => string
    logic.actionKeys[string] = key
  })
}
