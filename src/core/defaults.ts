import { BuiltLogic, Logic, LogicBuilder } from '../types'
import { getContext } from '../kea/context'
import { ActionsType } from './actions'

export interface DefaultsType<I = Record<string, any>> extends Logic {
  defaults: {
    [K in keyof I]: I[K]
  }
}

export function defaults<
  L extends Logic = Logic,
  R = Record<string, any>,
  I = ((logic: L) => (state: any, props: L['props']) => R) | ((logic: L) => R) | R,
  U = I extends (logic: Logic) => (state: any, props: L['props']) => infer R
    ? R
    : I extends (logic: Logic) => infer R
    ? R
    : I,
>(input: I): LogicBuilder<L, DefaultsType<U>> {
  return (logic) => {
    const defaults = typeof input === 'function' ? input(logic) : input

    if (typeof defaults === 'function') {
      logic.defaults['*'] = defaults
    } else if (typeof defaults === 'object') {
      const contextDefaults = getContextDefaults(logic)
      for (const [key, value] of Object.entries(defaults)) {
        logic.defaults[key] =
          contextDefaults && typeof contextDefaults[key] !== 'undefined' ? contextDefaults[key] : value
      }
    } else {
      throw new Error(`[KEA] Unknown defaults of type "${typeof defaults}" for logic "${logic.pathString}"`)
    }
    return null as any
  }
}

export function getContextDefaults(logic: BuiltLogic): Record<string, any> | void {
  let { reducerDefaults } = getContext()
  if (reducerDefaults && !('_keaAutomaticPath' in logic.path)) {
    if (getContext().options.flatDefaults) {
      if (reducerDefaults[logic.pathString]) {
        return reducerDefaults[logic.pathString]
      }
    } else {
      for (const part of logic.path) {
        reducerDefaults = reducerDefaults[part.toString()]
        if (typeof reducerDefaults !== 'object') {
          return
        }
      }
      return reducerDefaults
    }
  }
}
