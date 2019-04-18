// actions
let actionCache = {}

const isObject = (item) => typeof item === 'object' && !Array.isArray(item) && item !== null
const toSpaces = (key) => key.replace(/(?:^|\.?)([A-Z])/g, (x, y) => ' ' + y.toLowerCase()).replace(/^ /, '')

export function createAction (type, payloadCreator) {
  if (actionCache[type]) {
    return actionCache[type]
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

  actionCache[type] = action

  return action
}

export function createActions (input, output) {
  if (!input.actions) {
    return
  }

  const path = output.path
  const payloadCreators = input.actions(input)

  // remove scenes from path
  const pathString = (path[0] === 'scenes' ? path.slice(1) : path).join('.')

  Object.keys(payloadCreators).forEach(key => {
    const type = `${toSpaces(key)} (${pathString})`
    output.actions[key] = createAction(type, payloadCreators[key])
  })
}
