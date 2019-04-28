import { getCache } from '../../cache/provider'

const isObject = (item) => typeof item === 'object' && !Array.isArray(item) && item !== null

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
