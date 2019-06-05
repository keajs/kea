const isObject = (item) => typeof item === 'object' && !Array.isArray(item) && item !== null

export function createAction (type, payloadCreator) {
  const action = (...payloadArgs) => ({
    type: type,
    payload: typeof payloadCreator === 'function'
      ? payloadCreator(...payloadArgs)
      : isObject(payloadCreator)
        ? payloadCreator
        : { value: payloadCreator }
  })
  action.toString = () => type
  action._isKeaAction = true

  return action
}
