import { addReducer } from '../scene/store'

function isObject (item) {
  return (typeof item === 'object' && !Array.isArray(item) && item !== null)
}

export function createActionTransforms (mapping = []) {
  if (mapping.length % 2 === 1) {
    console.error('[KEA-LOGIC] uneven mapping given to selectActionsFromLogic:', mapping)
    console.trace()
    return
  }

  let hash = {}
  let transforms = {}

  for (let i = 0; i < mapping.length; i += 2) {
    let logic = mapping[i]
    const actionsArray = mapping[i + 1]

    if (logic._isKeaSingleton) {
      if (!logic._keaReducerConnected) {
        addReducer(logic.path, logic.reducer, true)
        logic._keaReducerConnected = true
      }
    }

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

let alreadyCreated = {}

export function clearActionCache () {
  alreadyCreated = {}
}

export function createAction (type, payloadCreator) {
  if (alreadyCreated[type]) {
    console.error(`[KEA-LOGIC] Already created action "${type}"`)
  }

  const action = (...payloadArgs) => ({
    type: type,
    payload: typeof payloadCreator === 'function'
      ? payloadCreator(...payloadArgs)
      : isObject(payloadCreator)
        ? payloadCreator
        : { value: payloadCreator }
  })
  action.toString = () => type

  alreadyCreated[type] = true

  return action
}

const toSpaces = (key) => key.replace(/(?:^|\.?)([A-Z])/g, (x, y) => ' ' + y.toLowerCase()).replace(/^ /, '')

export function createActions (mapping = {}, path) {
  const actions = {}
  const [scenes, ...rest] = typeof path === 'string' ? path.split('.') : path

  let fullPath = scenes === 'scenes' ? rest.join('.') : scenes + (rest.length > 0 ? '.' + rest.join('.') : '')
  Object.keys(mapping).forEach(key => {
    const fullKey = `${toSpaces(key)} (${fullPath})`
    actions[key] = createAction(fullKey, mapping[key])
  })

  return actions
}
