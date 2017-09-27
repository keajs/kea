function isObject (item) {
  return (typeof item === 'object' && !Array.isArray(item) && item !== null)
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
