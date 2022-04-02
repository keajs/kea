import { Logic, LogicBuilder, Selector, SelectorDefinitions } from '../types'
import { createSelector, ParametricSelector } from 'reselect'
import { getStoreState } from '../kea/context'

/**
  Logic builder:

      selector({
        duckAndChicken: [
          (s) => [s.duckId, s.chickenId],
          (duckId, chickenId) => duckId + chickenId,
        ],
      })

  Adds:

      logic.selector = state => state.scenes.farm // memoized via reselect
      logic.selectors = {
        duckAndChicken: state => logic.selector(state).duckAndChicken // memoized via reselect
      }
*/
export function selectors<L extends Logic = Logic>(
  input: SelectorDefinitions<L> | ((logic: L) => SelectorDefinitions<L>),
): LogicBuilder<L> {
  return (logic) => {
    const selectorInputs = typeof input === 'function' ? input(logic) : input

    // small cache so the order would not count
    const builtSelectors: Record<string, Selector> = {}
    for (const key of Object.keys(selectorInputs)) {
      logic.selectors[key] = (...args) => builtSelectors[key](...args)
    }

    for (const [key, [input, func]] of Object.entries(selectorInputs)) {
      const args = input(logic.selectors) as ParametricSelector<any, any, any>[]

      if (process.env.NODE_ENV !== 'production') {
        if (args.filter((a) => typeof a !== 'function').length > 0) {
          const argTypes = args.map((a) => typeof a).join(', ')
          const msg = `[KEA] Logic "${logic.pathString}", selector "${key}" has incorrect input: [${argTypes}].`
          throw new Error(msg)
        }
      }

      builtSelectors[key] = createSelector(args, func)
      logic.selectors[key] = (state = getStoreState(), props = logic.props) => builtSelectors[key](state, props)

      if (!logic.values.hasOwnProperty(key)) {
        Object.defineProperty(logic.values, key, {
          get: function () {
            return logic.selectors[key](getStoreState(), logic.props)
          },
          enumerable: true,
        })
      }
    }
  }
}
