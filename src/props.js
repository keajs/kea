import { createStructuredSelector } from 'reselect'

export function selectPropsFromLogic (mapping = []) {
  if (mapping.length % 2 === 1) {
    console.error('[KEA-LOGIC] uneven mapping given to selectPropsFromLogic:', mapping)
    console.trace()
    return
  }

  let hash = {}

  for (let i = 0; i < mapping.length; i += 2) {
    const logic = mapping[i]
    const props = mapping[i + 1]

    // we were given a function (state) => state.something as logic input
    const isFunction = typeof logic === 'function'

    const selectors = isFunction ? null : (logic.selectors ? logic.selectors : logic)

    props.forEach(query => {
      let from = query
      let to = query

      if (query.includes(' as ')) {
        [from, to] = query.split(' as ')
      }

      if (from === '*') {
        hash[to] = isFunction ? logic : (logic.selector ? logic.selector : selectors)
      } else if (isFunction) {
        hash[to] = (state) => logic(state)[from]
      } else if (typeof selectors[from] !== 'undefined') {
        hash[to] = selectors[from]
      } else {
        console.error(`[KEA-LOGIC] selector "${query}" missing for logic:`, logic)
        console.trace()
      }
    })
  }

  return createStructuredSelector(hash)
}
