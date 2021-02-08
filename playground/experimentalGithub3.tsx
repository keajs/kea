import {
  BuiltLogic,
  ListenerFunction,
  ListenerFunctionWrapper,
  LogicEventType,
  PartialRecord,
  PathType,
  Selector,
} from '../src'

export interface LogicWithFunctions {
  key: any
  actionCreators: Record<string, any>
  actionKeys: Record<string, string>
  actionTypes: Record<string, string>
  actions: {
    <A extends object>(actions: A): InjectActions2<LogicWithFunctions, A>
  }
  cache: Record<string, any>
  connections: { [pathString: string]: BuiltLogic }
  constants: Record<string, string>
  defaults: Record<string, any>
  listeners: Record<string, ListenerFunctionWrapper[]>
  path: PathType
  pathString: string
  props: any
  propTypes: Record<string, any>
  reducers: Record<string, any>
  reducerOptions: Record<string, any>
  reducer: any
  selector?: Selector
  selectors: Record<string, Selector>
  sharedListeners?: Record<string, ListenerFunction>
  values: Record<string, any>
  events: PartialRecord<LogicEventType, () => void>

  __keaTypeGenInternalSelectorTypes: Record<string, any>
  __keaTypeGenInternalReducerActions: Record<string, any>
}

type ActionsToTypes2<A extends Record<string, any>> = {
  [K in keyof A]: (actionParam: string, otherParam: boolean) => A[K]
}

type InjectActions2<
  L extends LogicWithFunctions,
  T extends object,
  L2 extends object = {
    actions: Merge<Merge<L['actions'], ActionsToTypes2<T>>, { <A extends object>(actions: A): InjectActions2<L2, A> }>
    actionCreators: Merge<L['actionsCreators'], ActionsToTypes2<T>>
  }
> = Merge<L, L2>

function logicCreator2<L extends LogicWithFunctions>(): L {
  return ({} as any) as L
}

const logi4 = logicCreator2().actions({ something1: true })
logi4.actions.something1('asd', true)

const logi5 = logicCreator2().actions({ something1: true }).actions({ something2: true })

logi5.actions.something1('asd', true)
logi5.actions.something2('asd', true)
