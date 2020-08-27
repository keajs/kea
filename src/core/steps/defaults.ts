import { getContext } from '../../context'
import { Logic, LogicInput } from '../../types'

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
export function createDefaults(logic: Logic, input: LogicInput): void {
  const {
    input: { defaults },
  } = getContext()

  if (defaults) {
    assignContextDefaults(logic, defaults)
  }

  if (input.defaults) {
    assignInputDefaults(logic, input)
  }
}

function assignContextDefaults(logic: Logic, defaults: Record<string, any>): void {
  const {
    options: { flatDefaults },
  } = getContext()

  if (flatDefaults) {
    if (defaults[logic.pathString]) {
      Object.assign(logic.defaults, defaults[logic.pathString])
    }
  } else {
    for (const part of logic.path) {
      defaults = defaults[part.toString()]
      if (typeof defaults !== 'object') {
        return
      }
    }
  }

  Object.assign(logic.defaults, defaults)
}

function assignInputDefaults(logic: Logic, input: LogicInput): void {
  let defaults: Record<string, any> = {}
  const defaultsSelector = typeof input.defaults === 'function' ? input.defaults(logic) : input.defaults

  if (typeof defaultsSelector === 'function') {
    defaults['*'] = defaultsSelector
  } else {
    defaults = defaultsSelector
  }

  Object.assign(logic.defaults, defaults)
}
