import { addReducer } from '../reducer'
import { deconstructMapping } from './mapping'

export function selectPropsFromLogic (propsMapping = []) {
  const propsArray = deconstructMapping(propsMapping)

  if (!propsArray) {
    return
  }

  let hash = {}

  propsArray.forEach(([logic, from, to]) => {
    // we were given a function (state) => state.something as logic input
    let isFunction = (typeof logic === 'function') && !logic._isKeaFunction

    if (logic._isKeaSingleton) {
      if (!logic._keaReducerConnected) {
        addReducer(logic.path, logic.reducer, true)
        logic._keaReducerConnected = true
      }
    }

    const selectors = isFunction ? null : (logic.selectors ? logic.selectors : logic)

    if (from === '*') {
      hash[to] = isFunction ? logic : (logic.selector ? logic.selector : selectors)
    } else if (isFunction) {
      hash[to] = (state) => (logic(state) || {})[from]
    } else if (typeof selectors[from] !== 'undefined') {
      hash[to] = selectors[from]
    } else {
      console.error(`[KEA-LOGIC] selector "${from}" missing for logic:`, logic)
      console.trace()
    }
  })

  return hash
}
