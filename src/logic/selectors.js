import { createSelector } from 'reselect'

// input: ['scenes', 'something', 'other'], state
// logic: state.scenes.something.other
export function pathSelector (path, state) {
  return ([state]).concat(path).reduce((v, a) => v[a])
}

export function createReducerSelectors (logic, input) {
  if (!logic.reducer) {
    return
  }

  logic.selector = state => pathSelector(logic.path, state)

  Object.keys(logic.reducers).forEach(key => {
    logic.selectors[key] = createSelector(logic.selector, state => state[key])
  })
}

export function createSelectors (logic, input) {
  if (!input.selectors) {
    return
  }

  const selectorInputs = input.selectors(logic)
  const selectorKeys = Object.keys(selectorInputs)

  // small cache so the order would not count
  let builtSelectors = {}
  selectorKeys.forEach(key => {
    logic.selectors[key] = (...args) => builtSelectors[key](...args)
  })

  Object.keys(selectorInputs).forEach(key => {
    const [input, func, type] = selectorInputs[key]
    const args = input()

    if (type) {
      logic.propTypes[key] = type
    }

    builtSelectors[key] = createSelector(...args, func)
    logic.selectors[key] = builtSelectors[key]
  })
}
