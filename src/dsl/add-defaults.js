import { getContext } from '../context'

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
export function addContextDefaults () {
  const { input: { defaults } } = getContext()
  const logic = getContext().build.building

  if (defaults) {
    assignContextDefaults(logic, defaults)
  }
}

export function addDefaults (inputDefaults) {
  const logic = getContext().build.building

  if (inputDefaults) {
    assignInputDefaults(logic, inputDefaults)
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

function assignInputDefaults (logic, inputDefaults) {
  let defaults = {}
  const defaultsSelector = typeof inputDefaults === 'function' ? inputDefaults(logic) : inputDefaults

  if (typeof defaultsSelector === 'function') {
    defaults['*'] = defaultsSelector
  } else {
    defaults = defaultsSelector
  }

  Object.assign(logic.defaults, defaults)
}
