import { createSelector } from 'reselect'
import { getContext } from '../index'
import { getStoreState } from '../context'

export function addSelectors (selectorsToAdd) {
  const logic = getContext().build.building

  const selectorKeys = Object.keys(selectorsToAdd)

  // small cache so the order would not count
  let builtSelectors = {}
  selectorKeys.forEach(key => {
    logic.selectors[key] = (...args) => builtSelectors[key](...args)
  })

  Object.keys(selectorsToAdd).forEach(key => {
    const [input, func, type] = selectorsToAdd[key]
    const args = input()

    if (type) {
      logic.propTypes[key] = type
    }

    if (process.env.NODE_ENV !== 'production') {
      if (args.filter(a => typeof a !== 'function').length > 0) {
        const msg = `[KEA] Logic "${logic.pathString}", selector "${key}" has incorrect input: [${args.map(a => typeof a).join(', ')}].`
        throw new Error(msg)
      }
    }

    builtSelectors[key] = createSelector(...args, func)
    logic.selectors[key] = (state = getStoreState(), props = logic.props) => builtSelectors[key](state, props)

    if (!logic.values.hasOwnProperty(key)) {
      Object.defineProperty(logic.values, key, {
        get: function () {
          return logic.selectors[key](getStoreState(), logic.props)
        },
        enumerable: true
      })
    }
  })
}
