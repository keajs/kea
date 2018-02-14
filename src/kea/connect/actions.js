import { deconstructMapping } from './mapping'

export function selectActionsFromLogic (mapping = []) {
  const actionsArray = deconstructMapping(mapping)

  if (!actionsArray) {
    return
  }

  let hash = {}

  actionsArray.forEach(([logic, from, to]) => {
    const actions = logic && logic.actions ? logic.actions : logic
    const keyCreator = (logic && logic._keaKeyCreator) || null

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

  return hash
}
