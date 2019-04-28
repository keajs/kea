import { combineReducers } from 'redux'

const emptyObject = {}

/*
  logic.reducers = { duckId: function () {} }

  ... converts to:

  logic.reducer = combineReducers(logic.reducers)
*/
export function createReducer (logic, input) {
  if (!input.reducers) {
    return
  }

  if (Object.keys(logic.reducers).length > 0) {
    logic.reducer = combineReducers(logic.reducers)
  } else {
    logic.reducer = () => emptyObject
  }
}
