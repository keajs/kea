import { combineReducers } from 'redux'

const emptyObject = {}

export function createReducers (logic, input) {
  if (!input.reducers || !logic.reducerInputs) {
    return
  }

  Object.keys(logic.reducerInputs).forEach(key => {
    const reducerInput = logic.reducerInputs[key]

    logic.propTypes[key] = reducerInput.type
    logic.defaults[key] = reducerInput.value
    logic.reducers[key] = reducerInput.reducer
  })

  if (Object.keys(logic.reducers).length > 0) {
    logic.reducer = combineReducers(logic.reducers)
  } else {
    logic.reducer = () => emptyObject
  }
}

