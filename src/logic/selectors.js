import { createSelector } from 'reselect'

// input: ['scenes', 'something', 'other'], state
// output: state.scenes.something.other
export function pathSelector (path, state) {
  return ([state]).concat(path).reduce((v, a) => v[a])
}

export function safePathSelector (path, state) {
  return ([state]).concat(path).reduce((v, a) => (v || {})[a])
}

export function createReducerSelectors (input, output) {
  if (!output.path) {
    return
  }

  const rootSelector = state => pathSelector(output.path, state)

  output.selector = rootSelector
  output.selectors.root = rootSelector

  Object.keys(output.reducers).forEach(key => {
    output.selectors[key] = createSelector(rootSelector, state => state[key])
  })
}

export function createSelectors (input, output) {
  if (!input.selectors) {
    return
  }

  const selectorInputs = input.selectors(output)
  const selectorKeys = Object.keys(selectorInputs)

  // small cache so the order would not count
  let builtSelectors = {}
  selectorKeys.forEach(key => {
    output.selectors[key] = (...args) => builtSelectors[key](...args)
  })

  Object.keys(selectorInputs).forEach(key => {
    const [input, func, type] = selectorInputs[key]
    const args = input()

    if (type) {
      output.propTypes[key] = type
    }

    builtSelectors[key] = createSelector(...args, func)
    output.selectors[key] = builtSelectors[key]
  })
}
