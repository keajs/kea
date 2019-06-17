import { getContext } from "../../context"

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
  const { input: { defaults } } = getContext()

  if (defaults) {
    assignContextDefaults(logic, defaults)
  }

  if (input.defaults) {
    assignInputDefaults(logic, input)
  }
}

function assignContextDefaults (logic, defaults) {
  const { options: { flatDefaults } } = getContext()

  if (flatDefaults) {
    if (defaults[logic.pathString]) {
      Object.assign(logic.defaults, defaults[logic.pathString])
    }
  } else {
    for (const part of logic.path) {
      defaults = defaults[part]
      if (typeof defaults !== 'object') {
        return
      }
    }
  }

  Object.assign(logic.defaults, defaults)
}

function assignInputDefaults (logic, input) {
  let defaults = {}
  const defaultsSelector = typeof input.defaults === 'function' ? input.defaults(logic) : input.defaults

  if (typeof defaultsSelector === 'function') {
    defaults['*'] = defaultsSelector
  } else {
    defaults = defaultsSelector
  }

  Object.assign(logic.defaults, defaults)
}