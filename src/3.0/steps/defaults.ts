import { Logic, LogicBuilder } from '../../types'

// TODO: context defaults?
export function defaults<L extends Logic = Logic>(
  input:
    | ((logic: L) => (state: any, props: L['props']) => Partial<{ [T in keyof L['values']]: L['values'][T] }>)
    | ((logic: L) => Partial<{ [T in keyof L['values']]: L['values'][T] }>)
    | Partial<{ [T in keyof L['values']]: L['values'][T] }>,
): LogicBuilder<L> {
  return (logic) => {
    let defaults: Record<string, any> = {}
    const defaultsSelector = typeof input === 'function' ? input(logic) : input

    if (typeof defaultsSelector === 'function') {
      defaults['*'] = defaultsSelector
    } else {
      defaults = defaultsSelector
    }
    Object.assign(logic.defaults, defaults)
  }
}
