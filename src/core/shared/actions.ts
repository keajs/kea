interface KeaReduxAction {
  type: string
  payload: any
}

interface KeaAction {
  (...args: any[]): KeaReduxAction
  _isKeaAction: boolean
  toString(): string
}

const isObject = (item: any) => typeof item === 'object' && !Array.isArray(item) && item !== null

export function createAction(type: string, payloadCreator: (...args: any[]) => any): KeaAction {
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

const toSpaces = (key: string) => key.replace(/(?:^|\.?)([A-Z])/g, (x, y) => ' ' + y.toLowerCase()).replace(/^ /, '')

export function createActionType(key: string, pathString: string): string {
  return `${toSpaces(key)} (${pathString})`
}
