import { deconstructMapping } from './mapping'

export function selectActionsFromLogic (mapping = []) {
  const { response: actionsArray, logics } = deconstructMapping(mapping)

  if (!actionsArray) {
    return
  }

  let hash = {}
  let meta = {}

  meta.withKeyCreator = false
  meta.keyCreators = []

  actionsArray.forEach(([logic, from, to]) => {
    const actions = logic && logic.actions ? logic.actions : logic
    const keyCreator = logic && logic._keaKeyCreator && typeof logic._keaKeyCreator === 'function' ? logic._keaKeyCreator : null

    if (typeof actions[from] === 'function') {
      hash[to] = actions[from]
      if (keyCreator) {
        hash[to]._keaKeyCreator = keyCreator
      }
    } else {
      console.error(`[KEA-LOGIC] action "${from}" missing for logic:`, logic)
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

  return { actions: hash, meta }
}
