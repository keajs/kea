import { getCache } from '../../cache'

const isObject = (item) => typeof item === 'object' && !Array.isArray(item) && item !== null
const toSpaces = (key) => key.replace(/(?:^|\.?)([A-Z])/g, (x, y) => ' ' + y.toLowerCase()).replace(/^ /, '')

/*
  input.actions = ({ path, constants }) => ({
    setDuckId: (duckId) => ({ duckId })
  })

  ... converts to:

  logic.actions == {
    setDuckId: (duckId) => ({ type: 'set duck (...)', payload: { duckId } }),
  }
*/
export function createActions (logic, input) {
  if (!input.actions) {
    return
  }

  const path = logic.path
  const payloadCreators = input.actions(input)

  Object.keys(payloadCreators).forEach(key => {
    logic.actions[key] = createAction(createActionType(key, path), payloadCreators[key])
  })
}

export function createActionType (key, path) {
  // remove 'scenes.' from the path
  const pathString = (path[0] === 'scenes' ? path.slice(1) : path).join('.')
  return `${toSpaces(key)} (${pathString})`
}

export function createAction (type, payloadCreator) {
  const { actions: actionCache } = getCache()

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
