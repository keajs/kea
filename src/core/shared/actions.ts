interface KeaReduxAction {
  type: string
  payload: object
}

interface KeaAction {
  (...args: any[]): KeaReduxAction
  _isKeaAction: boolean
  toString(): string
}

const isObject = (item: any) => typeof item === 'object' && !Array.isArray(item) && item !== null

export function createAction(type: string, payloadCreator: (...args: any[]) => object): KeaAction {
  const action = <KeaAction>(...payloadArgs: any[]) =>
    ({
      type: type,
      payload:
        typeof payloadCreator === 'function'
          ? payloadCreator(...payloadArgs)
          : isObject(payloadCreator)
          ? payloadCreator
          : { value: payloadCreator },
    } as KeaReduxAction)
  action.toString = () => type
  action._isKeaAction = true

  return action
}
