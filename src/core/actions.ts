import { ActionDefinitions, KeaAction, KeaReduxAction, Logic, LogicBuilder, PayloadCreatorDefinition } from '../types'
import { getContext, getPluginContext } from '../kea/context'
import type { ListenersPluginContext } from './listeners'
import { isBreakpoint } from './listeners'

let asyncCounter = 0
const nextQueryId = () => String(++asyncCounter)

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
        getContext().store.dispatch({ ...builtAction, queryId: nextQueryId() })
      }
      logic.actions[key].toString = () => type
      logic.asyncActions[key] = async (...inp: any[]) => {
        const builtAction = actionCreator(...inp)
        let queryId = nextQueryId()
        getContext().store.dispatch({ ...builtAction, queryId })
        const { pendingQueries } = getPluginContext<ListenersPluginContext>('listeners')
        while (true) {
          const promises = pendingQueries.get(queryId)
          if (!promises) {
            return
          }
          try {
            const responses = await Promise.all(promises)
            return responses[0]
          } catch (e: any) {
            if (isBreakpoint(e)) {
              if ('__keaQueryId' in e) {
                queryId = e.__keaQueryId
                // loop again
              }
            } else {
              throw e
            }
          }
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
