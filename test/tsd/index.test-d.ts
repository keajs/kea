import { expectType } from 'tsd'

import {
  kea,
  MakeLogicType,
  BuiltLogic,
  PathType,
  Selector,
  ListenerFunctionWrapper,
  KeaReduxAction,
  KeyType,
  ReducerFunction,
  // It's a bit of a hack, but it works! :-)
  // This file is copied to "lib/" and tested against the built bundle, thus we are importing from "." (index.js)
  // ... requiring the following comments:
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
} from '.'

/*
 * 1. Setup Test MakeLogicType<Values, Actions, Props>
 */

interface DashboardValues {
  id: number
  created_at: string
  name: string
  pinned: boolean
}

interface DashboardActions {
  setName: (name: string) => { name: string }
  setUsername: (username: string) => { username: string }
}

interface DashboardProps {
  id: number
}

type MyLogicType = MakeLogicType<DashboardValues, DashboardActions, DashboardProps>

const logic = kea<MyLogicType>({})
const extendedLogic = kea({}).extend<MyLogicType>({})

/*
 * 2. Test MakeLogicType<Values, Actions, Props>
 *    - Test overridden fields
 */

expectType<typeof logic>(extendedLogic)

expectType<{
  setName: (name: string) => { type: string; payload: { name: string } }
  setUsername: (username: string) => { type: string; payload: { username: string } }
}>(logic.actionCreators)

expectType<Record<string, string>>(logic.actionKeys)

expectType<{
  setName: string
  setUsername: string
}>(logic.actionTypes)

expectType<{
  setName: (name: string) => void
  setUsername: (username: string) => void
}>(logic.actions)

expectType<DashboardValues>(logic.defaults)
expectType<DashboardProps>(logic.props)
expectType<DashboardValues>(logic.values)
expectType<(state: DashboardValues, action: KeaReduxAction, fullState: any) => DashboardValues>(logic.reducer)

expectType<{
  id: (state: number, action: KeaReduxAction, fullState: any) => number
  created_at: (state: string, action: KeaReduxAction, fullState: any) => string
  name: (state: string, action: KeaReduxAction, fullState: any) => string
  pinned: (state: boolean, action: KeaReduxAction, fullState: any) => boolean
}>(logic.reducers)

expectType<(state: any, props: DashboardProps) => DashboardValues>(logic.selector)

expectType<{
  id: (state: any, props: DashboardProps) => number
  created_at: (state: any, props: DashboardProps) => string
  name: (state: any, props: DashboardProps) => string
  pinned: (state: any, props: DashboardProps) => boolean
}>(logic.selectors)

expectType<{
  id: (...args: any) => number
  created_at: (...args: any) => string
  name: (...args: any) => string
  pinned: (...args: any) => boolean
}>(logic.__keaTypeGenInternalSelectorTypes)

/*
 * 3. Test MakeLogicType<Values, Actions, Props>
 *    - Test default fields
 */

expectType<KeyType | undefined>(logic.key)
expectType<Record<string, any>>(logic.cache)
expectType<{ [pathString: string]: BuiltLogic }>(logic.connections)
expectType<Record<string, ListenerFunctionWrapper[]> | undefined>(logic.listeners)
expectType<PathType>(logic.path)
expectType<string>(logic.pathString)
expectType<{
  beforeMount?: (() => void) | undefined
  afterMount?: (() => void) | undefined
  beforeUnmount?: (() => void) | undefined
  afterUnmount?: (() => void) | undefined
  propsChanged?: ((props: any, oldProps: any) => void) | undefined
}>(logic.events)
expectType<Record<string, any>>(logic.__keaTypeGenInternalReducerActions)

/*
 * 4. Test Empty Logic
 */

const logic2 = kea({})

expectType<KeyType | undefined>(logic2.key)
expectType<Record<string, any>>(logic2.cache)
expectType<{ [pathString: string]: BuiltLogic }>(logic2.connections)
expectType<Record<string, ListenerFunctionWrapper[]> | undefined>(logic2.listeners)
expectType<PathType>(logic2.path)
expectType<string>(logic2.pathString)
expectType<{
  beforeMount?: (() => void) | undefined
  afterMount?: (() => void) | undefined
  beforeUnmount?: (() => void) | undefined
  afterUnmount?: (() => void) | undefined
  propsChanged?: ((props: any, oldProps: any) => void) | undefined
}>(logic2.events)
expectType<Record<string, any>>(logic2.__keaTypeGenInternalReducerActions)

// new compared to test 3
expectType<Record<string, any>>(logic2.actionCreators)
expectType<Record<string, string>>(logic2.actionKeys)
expectType<Record<string, string>>(logic2.actionTypes)
expectType<Record<string, any>>(logic2.actions)
expectType<Record<string, any>>(logic2.defaults)
expectType<any>(logic2.props)
expectType<Record<string, any>>(logic2.values)
expectType<ReducerFunction<any> | undefined>(logic2.reducer)
expectType<Record<string, any>>(logic2.reducers)
expectType<Selector | undefined>(logic2.selector)
expectType<Record<string, Selector>>(logic2.selectors)
expectType<Record<string, any>>(logic2.__keaTypeGenInternalSelectorTypes)
