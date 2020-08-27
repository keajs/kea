import { createSelector, ParametricSelector } from 'reselect'
import { getStoreState } from '../../context'
import { Logic, LogicInput, Selector } from '../../types'

/*
  input.selectors = ({ selectors }) => ({
    duckAndChicken: [
      () => [selectors.duckId, selectors.chickenId],
      (duckId, chickenId) => duckId + chickenId,
      PropType.number
    ],
  })

  ... converts to

  logic.selector = state => state.scenes.farm // memoized via reselect
  logic.selectors = {
    duckAndChicken: state => logic.selector(state).duckAndChicken // memoized via reselect
  }
*/
export function createSelectors(logic: Logic, input: LogicInput): void {
  if (!input.selectors) {
    return
  }

  const selectorInputs = typeof input.selectors === 'function' ? input.selectors(logic) : input.selectors
  const selectorKeys = Object.keys(selectorInputs)

  // small cache so the order would not count
  const builtSelectors: Record<string, Selector> = {}
  selectorKeys.forEach((key) => {
    logic.selectors[key] = (...args) => builtSelectors[key](...args)
  })

  Object.keys(selectorInputs).forEach((key) => {
    const [input, func, type] = selectorInputs[key]!
    const args = input(logic.selectors) as ParametricSelector<any, any, any>[]

    if (type) {
      logic.propTypes[key] = type
    }

    if (process.env.NODE_ENV !== 'production') {
      if (args.filter((a) => typeof a !== 'function').length > 0) {
        const argTypes = args.map((a) => typeof a).join(', ')
        const msg = `[KEA] Logic "${logic.pathString}", selector "${key}" has incorrect input: [${argTypes}].`
        throw new Error(msg)
      }
    }

    builtSelectors[key] = createSelector(args, func)
    logic.selectors[key] = (state = getStoreState(), props = logic.props) => builtSelectors[key](state, props)
  })
}
