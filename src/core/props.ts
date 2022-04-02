import { Logic, LogicBuilder } from '../types'

export function props<L extends Logic = Logic>(input: L['props']): LogicBuilder<L> {
  return (logic) => {
    logic.props = input
  }
}
