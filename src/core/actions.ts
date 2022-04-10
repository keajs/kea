import {
  ActionCreatorForPayloadBuilder,
  ActionDefinitions,
  ActionForPayloadBuilder,
  AnyFunction,
  KeaAction,
  KeaReduxAction,
  Logic,
  LogicBuilder,
} from '../types'
import { getContext } from '../kea/context'

export interface ActionsType<Actions = Record<string, AnyFunction>> extends Logic {
  actionCreators: {
    [ActionKey in keyof Actions]: Actions[ActionKey] extends AnyFunction
      ? ActionCreatorForPayloadBuilder<Actions[ActionKey]>
      : never
  }
  actionKeys: Record<string, string>
  actionTypes: {
    [ActionKey in keyof Actions]: string
  }
  actions: {
    [ActionKey in keyof Actions]: Actions[ActionKey] extends AnyFunction
      ? ActionForPayloadBuilder<Actions[ActionKey]>
      : never
  }
}

/** Logic builder: actions({ key: (id) => ({ id }) }) */
export function actions<
  L extends Logic = Logic,
  R = Record<string, any>,
  I = ((logic: L) => R) | R,
  U = I extends (logic: Logic) => infer R ? R : I
>(
  input: I,
): LogicBuilder<L, ActionsType<U>> {
  return (logic) => {
    const actions = typeof input === 'function' ? input(logic) : input
    for (const [key, payloadCreator] of Object.entries(actions)) {
      const actionCreator: KeaAction =
        typeof payloadCreator === 'function' && '_isKeaAction' in payloadCreator
          ? payloadCreator
          : createActionCreator(createActionType(key, logic.pathString), payloadCreator)
      const type = actionCreator.toString()

      logic.actionCreators[key] = actionCreator
      logic.actions[key] = (...inp: any[]) => {
        const builtAction = actionCreator(...inp)
        getContext().store.dispatch(builtAction)
      }
      logic.actions[key].toString = () => type
      logic.actionKeys[type] = key
      logic.actionTypes[key] = type
    }
    return null as any
  }
}

export function createActionCreator(type: string, payloadCreator: any | ((...args: any[]) => any)): KeaAction {
  const isObject = (item: any) => typeof item === 'object' && !Array.isArray(item) && item !== null
  const action = <KeaAction>(...payloadArgs: any[]): KeaReduxAction => ({
    type: type,
    payload:
      typeof payloadCreator === 'function'
        ? payloadCreator(...payloadArgs)
        : isObject(payloadCreator)
        ? payloadCreator
        : { value: payloadCreator },
  })
  action.toString = () => type
  action._isKeaAction = true

  return action
}

export function createActionType(key: string, pathString: string): string {
  const toSpaces = (key: string) => key.replace(/(?:^|\.?)([A-Z])/g, (x, y) => ' ' + y.toLowerCase()).replace(/^ /, '')
  return `${toSpaces(key)} (${pathString})`
}
