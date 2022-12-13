import { ActionDefinitions, KeaAction, KeaReduxAction, Logic, LogicBuilder, PayloadCreatorDefinition } from '../types'
import { getContext, getPluginContext } from '../kea/context'
import type { ListenersPluginContext } from './listeners'

let asyncCounter = 0

/** Logic builder: actions({ actionWithParams: (id) => ({ id }), actionNoParams: true }) */
export function actions<L extends Logic = Logic>(
  input: ActionDefinitions<L> | ((logic: L) => ActionDefinitions<L>),
): LogicBuilder<L> {
  return (logic) => {
    const actions = typeof input === 'function' ? input(logic) : input
    for (const [key, payloadCreator] of Object.entries(actions)) {
      const actionCreator: KeaAction =
        typeof payloadCreator === 'function' && '_isKeaAction' in payloadCreator
          ? (payloadCreator as KeaAction)
          : createActionCreator(createActionType(key, logic.pathString), payloadCreator ?? true)
      const type = actionCreator.toString()

      logic.actionCreators[key] = actionCreator
      logic.actions[key] = (...inp: any[]) => {
        const builtAction = actionCreator(...inp)
        getContext().store.dispatch(builtAction)
      }
      logic.actions[key].toString = () => type
      logic.asyncActions[key] = async (...inp: any[]) => {
        const builtAction = actionCreator(...inp)
        const queryId = `async-${++asyncCounter}`
        getContext().store.dispatch({ ...builtAction, queryId })
        const promises = getPluginContext<ListenersPluginContext>('listeners').pendingQueries.get(queryId)
        if (promises) {
          return Promise.all(promises)
        }
      }
      logic.asyncActions[key].toString = () => type
      logic.actionKeys[type] = key
      logic.actionTypes[key] = type
    }
  }
}

export function createActionCreator(type: string, payloadCreator: PayloadCreatorDefinition): KeaAction {
  const action = <KeaAction>(...payloadArgs: any[]): KeaReduxAction => ({
    type: type,
    payload: typeof payloadCreator === 'function' ? payloadCreator(...payloadArgs) : { value: true },
  })
  action.toString = () => type
  action._isKeaAction = true

  return action
}

export function createActionType(key: string, pathString: string): string {
  const toSpaces = (key: string) => key.replace(/(?:^|\.?)([A-Z])/g, (x, y) => ' ' + y.toLowerCase()).replace(/^ /, '')
  return `${toSpaces(key)} (${pathString})`
}
