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

export function createActions(logic, input) {
  Object.keys(logic.actionCreators).forEach((key) => {
    const actionCreator = logic.actionCreators[key]
    const type = actionCreator.toString()

    // we must add the action on the run heap, otherwise if in a listener we dispatch an action,
    // which causes a react re-render, all logic.build() calls in the react component will be
    // connected to the listener
    logic.actions[key] = (...inp) => {
      const builtAction = actionCreator(...inp)
      getContext().run.heap.push({ type: 'action', action: builtAction, logic })
      try {
        return getContext().store.dispatch(builtAction)
      } finally {
        getContext().run.heap.pop()
      }
    }
    logic.actions[key].toString = () => type
    logic.actionKeys[type] = key
  })
}
