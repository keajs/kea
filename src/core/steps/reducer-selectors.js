import { createSelector } from 'reselect'

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

// input: ['scenes', 'something', 'other'], state
// output: state.scenes.something.other
function pathSelector (path, state) {
  return ([state]).concat(path).reduce((v, a) => v[a])
}
