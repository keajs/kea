import { createSelector } from 'reselect'

// input: ['scenes', 'something', 'other'], state
// output: state.scenes.something.other
export function pathSelector (path, state) {
  return ([state]).concat(path).reduce((v, a) => v[a])
}

export function safePathSelector (path, state) {
  return ([state]).concat(path).reduce((v, a) => (v || {})[a])
}

// input: ['states', 'something', 'other'], ['key1', 'key2', 'key3'], { bla: 'asdf' }
// output: {
//   root: (state) => states.something.other,
//   key1: (state) => states.something.other.key1,
//   key2: (state) => states.something.other.key2,
//   key3: (state) => states.something.other.key3,
//   bla: 'asdf'
// }
export function createSelectors (path, keys, additional = {}) {
  const rootSelector = (state) => pathSelector(path, state)

  let selectors = {
    root: rootSelector
  }

  keys.forEach(key => {
    selectors[key] = createSelector(rootSelector, state => state[key])
  })

  return Object.assign(selectors, additional)
}
