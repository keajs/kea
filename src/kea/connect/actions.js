import { deconstructMapping } from './mapping'

export function selectActionsFromLogic (mapping = []) {
  const actionsArray = deconstructMapping(mapping)

  if (!actionsArray) {
    return
  }

  let hash = {}

  actionsArray.forEach(([logic, from, to]) => {
    const actions = logic && logic.actions ? logic.actions : logic

    if (typeof actions[from] === 'function') {
      hash[to] = actions[from]
    } else {
      console.error(`[KEA-LOGIC] action "${from}" missing for logic:`, logic)
      console.trace()
    }
  })

  return hash
}
