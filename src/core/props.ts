import { Logic, LogicBuilder } from '../types'

export function props<L extends Logic = Logic>(input: L['props']): LogicBuilder<L> {
  return (logic) => {
    let change = false
    for (const [key, value] of Object.entries(input)) {
      if (logic.props[key] !== value) {
        change = true // don't modify the reference if resulting props are identical
        break
      }
    }
    if (change) {
      // set the props that haven't been passed in to the defaults
      logic.props = { ...input, ...logic.props }
    }
  }
}
