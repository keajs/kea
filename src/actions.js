export function createActionTransforms (mapping = []) {
  if (mapping.length % 2 === 1) {
    console.error('[KEA-LOGIC] uneven mapping given to selectActionsFromLogic:', mapping)
    console.trace()
    return
  }

  let hash = {}
  let transforms = {}

  for (let i = 0; i < mapping.length; i += 2) {
    const logic = mapping[i]
    const actionsArray = mapping[i + 1]

    const actions = logic && logic.actions ? logic.actions : logic

    actionsArray.forEach(query => {
      let from = query
      let to = query

      if (query.includes(' as ')) {
        [from, to] = query.split(' as ')
      }

      const matches = from.match(/^(.*)\((.*)\)$/)

      if (matches) {
        if (from === to) {
          to = matches[1]
        }
        from = matches[1]
        transforms[to] = matches[2].split(',').map(s => s.trim())
      }

      if (typeof actions[from] === 'function') {
        hash[to] = actions[from]
      } else {
        console.error(`[KEA-LOGIC] action "${query}" missing for logic:`, logic)
        console.trace()
      }
    })
  }

  return {
    actions: hash,
    transforms
  }
}

export function selectActionsFromLogic (mapping = []) {
  return createActionTransforms(mapping).actions
}