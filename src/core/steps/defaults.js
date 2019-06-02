/*
  input.defaults = ({ actions, selectors }) => (state, props) => ({
    key1: selectors.something(state).key1,
    key2: selectors.other(state, props).key2
  })

  ... converts to:

  logic.defaults = {
    key1: 10,
    key2: 20
  }
*/
export function createDefaults (logic, input) {
  if (!input.defaults) {
    return
  }

  let defaults = {}

  if (input.defaults) {
    const defaultsSelector = typeof input.defaults === 'function' ? input.defaults(logic) : input.defaults

    if (typeof defaultsSelector === 'function') {
      defaults['*'] = defaultsSelector
    } else {
      defaults = defaultsSelector
    }
  }

  Object.assign(logic.defaults, defaults)
}
