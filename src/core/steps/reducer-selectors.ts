import { createSelector } from 'reselect'
import { getStoreState } from '../../context'
import { Logic, LogicInput, PathType } from '../../types'

/*
  logic.reducers = { duckId: function () {} }

  ... converts to

  logic.selectors = { duckId: (state) => state.scenes.ducks.duckId } // memoized via reselect
*/
export function createReducerSelectors(logic: Logic, input: LogicInput): void {
  if (!logic.reducer) {
    return
  }

  logic.selector = (state = getStoreState()) => pathSelector(logic.path, state)

  Object.keys(logic.reducers).forEach((key) => {
    logic.selectors[key] = createSelector(logic.selector!, (state) => state[key])
  })
}

// input: ['scenes', 'something', 'other'], state
// output: state.scenes.something.other
function pathSelector(path: PathType, state: any) {
  return [state].concat(path).reduce((v, a) => {
    if (a in v) {
      return v[a]
    }
    throw new Error(`[KEA] Can not find path "${path.join('.')}" in the store.`)
  })
}
