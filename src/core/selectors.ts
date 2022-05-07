import { Logic, LogicBuilder, Selector, SelectorDefinition, SelectorDefinitions } from '../types'
import { createSelector, createSelectorCreator, defaultMemoize, ParametricSelector } from 'reselect'
import { getStoreState } from '../kea/context'

/**
  Logic builder:

      selector({
        duckAndChicken: [
          (s) => [s.duckId, s.chickenId],
          (duckId, chickenId) => duckId + chickenId,
          (a: any, b: any) => bool, // custom isEquals, defaults to `a === b`
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
      if (typeof logic.selectors[key] !== 'undefined') {
        throw new Error(`[KEA] Logic "${logic.pathString}" selector "${key}" already exists`)
      }
      addSelectorAndValue(logic, key, (...args) => builtSelectors[key](...args))
    }

    for (const entry of Object.entries(selectorInputs)) {
      const [key, [input, func, memoizeOptions]]: [string, SelectorDefinition<L['selectors'], any>] = entry
      const args = input(logic.selectors) as ParametricSelector<any, any, any>[]

      if (args.filter((a) => typeof a !== 'function').length > 0) {
        const argTypes = args.map((a) => typeof a).join(', ')
        const msg = `[KEA] Logic "${logic.pathString}", selector "${key}" has incorrect input: [${argTypes}].`
        throw new Error(msg)
      }
      builtSelectors[key] = createSelector(args, func, { memoizeOptions })

      addSelectorAndValue(logic, key, (state = getStoreState(), props = logic.props) =>
        builtSelectors[key](state, props),
      )

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

export function addSelectorAndValue<L extends Logic = Logic>(logic: L, key: string, selector: Selector): void {
  logic.selectors[key] = selector
  if (!logic.values.hasOwnProperty(key)) {
    Object.defineProperty(logic.values, key, {
      get: function () {
        return logic.selectors[key](getStoreState(), logic.props)
      },
      enumerable: true,
    })
  }
}
