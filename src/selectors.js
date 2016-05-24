import { createSelector } from 'reselect'

export function pathSelector (path, state) {
  return ([state]).concat(path).reduce((v, a) => v[a])
}

export function createSelectors (path, reducer, additional = {}) {
  const selector = (state) => pathSelector(path, state)
  const keys = Object.keys(typeof reducer === 'function' ? reducer() : reducer)

  let selectors = {
    root: selector
  }

  keys.forEach(key => {
    selectors[key] = createSelector(selector, state => state[key])
  })

  return Object.assign(selectors, additional)
}
