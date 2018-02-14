import { deconstructMapping } from './mapping'

export function selectPropsFromLogic (propsMapping = []) {
  const { response: propsArray, logics } = deconstructMapping(propsMapping)

  if (!propsArray) {
    return
  }

  let hash = {}
  let meta = {}

  propsArray.forEach(([logic, from, to]) => {
    // we were given a function (state) => state.something as logic input
    const isFunction = (typeof logic === 'function') && !logic._isKeaFunction
    const selectors = isFunction ? null : (logic.selectors ? logic.selectors : logic)

    if (from === '*') {
      hash[to] = isFunction ? logic : (logic.selector ? logic.selector : selectors)
    } else if (isFunction) {
      hash[to] = (state, props) => (logic(state, props) || {})[from]
    } else if (typeof selectors[from] !== 'undefined') {
      hash[to] = selectors[from]
    } else if (logic && logic._isKeaSingleton === false) {
      console.error(`[KEA-LOGIC] it's not possible to connect to dynamic logic stores directly. Use "logic.withKey(props => props.id)" instead`)
      console.trace()
    } else {
      console.error(`[KEA-LOGIC] selector "${from}" missing for logic:`, logic)
      console.trace()
    }
  })

  // add some metadata, especially if we're connecting a to dynamic logic store
  meta.withKeyCreator = false
  meta.keyCreators = []
  logics.forEach(logic => {
    const keyCreator = logic && logic._keaKeyCreator && typeof logic._keaKeyCreator === 'function' ? logic._keaKeyCreator : null

    if (keyCreator) {
      meta.withKeyCreator = true
      meta.keyCreators.push(keyCreator)
    }
  })

  return { props: hash, meta }
}
