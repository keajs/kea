import { createSelector } from 'reselect'
import { pathSelector } from './selectors'

/*
  logic.reducers = { duckId: function () {} }

  ... converts to

  logic.selectors = { duckId: (state) => state.scenes.ducks.duckId } // memoized via reselect
*/
export function createReducerSelectors (logic, input) {
  if (!logic.reducer) {
    return
  }

  logic.selector = state => pathSelector(logic.path, state)

  Object.keys(logic.reducers).forEach(key => {
    logic.selectors[key] = createSelector(logic.selector, state => state[key])
  })
}
