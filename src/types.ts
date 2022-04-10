import { Reducer, Store, Middleware, StoreEnhancer, compose, AnyAction } from 'redux'
import { Context as ReactContext, ComponentType, FunctionComponent } from 'react'

// universal helpers
export type AnyComponent = ComponentType | FunctionComponent
export type KeyType = string | number | boolean
export type PathType = KeyType[]
export type Selector = (state?: any, props?: any) => any
export type Props = Record<string, any> // nb! used in kea and react
export type LogicEventType = 'beforeMount' | 'afterMount' | 'beforeUnmount' | 'afterUnmount'
export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>

// logic base class
export interface Logic {
  // logic
  path: PathType
  pathString: string
  props: any
  key?: KeyType
  keyBuilder?: (props: any) => KeyType

  // core
  actionCreators: Record<string, any>
  actionKeys: Record<string, string>
  actionTypes: Record<string, string>
  actions: Record<string, any>
  cache: Record<string, any>
  connections: { [pathString: string]: BuiltLogic }
  defaults: Record<string, any>
  reducers: Record<string, any>
  reducer?: ReducerFunction<any>
  selector?: Selector
  selectors: Record<string, Selector>
  values: Record<string, any>
  events: PartialRecord<LogicEventType, () => void>

  // listeners
  listeners?: Record<string, ListenerFunctionWrapper[]>
  sharedListeners?: Record<string, ListenerFunction>

  __keaTypeGenInternalSelectorTypes: Record<string, any>
  __keaTypeGenInternalReducerActions: Record<string, any>
  __keaTypeGenInternalExtraInput: Record<string, any>
}

export interface BuiltLogicAdditions<LogicType extends Logic> {
  _isKeaBuild: boolean
  mount: () => () => void
  unmount: () => void
  isMounted: () => boolean
  extend: <ExtendLogicType extends Logic = LogicType>(
    extendedInput: LogicInput<ExtendLogicType> | LogicInput<ExtendLogicType>[],
  ) => LogicWrapper<ExtendLogicType>
  wrapper: LogicWrapper
}

export type BuiltLogic<LogicType extends Logic = Logic> = LogicType & BuiltLogicAdditions<LogicType>

export interface LogicWrapperAdditions<LogicType extends Logic> {
  _isKea: boolean
  inputs: (LogicInput | LogicBuilder)[] // store as generic
  <T extends LogicType['props'] | AnyComponent>(props: T): T extends LogicType['props']
    ? BuiltLogic<LogicType>
    : FunctionComponent
  (): BuiltLogic<LogicType>
  wrap: (Component: AnyComponent) => KeaComponent
  build: (props?: LogicType['props']) => BuiltLogic<LogicType>
  mount: () => () => void
  unmount: () => void
  isMounted: (props?: Record<string, any>) => boolean
  findMounted: (props?: Record<string, any>) => BuiltLogic<LogicType> | null
  extend: <ExtendLogicType extends Logic = LogicType>(
    extendedInput: LogicInput<ExtendLogicType>,
  ) => LogicWrapper<ExtendLogicType>
}

export type LogicWrapper<LogicType extends Logic = Logic> = LogicType & LogicWrapperAdditions<LogicType>
export type LogicBuilder<L extends Logic = Logic, R extends Logic = Logic> = ((logic: BuiltLogic<L>) => R)

// input helpers (using the generated logic type as input)

export type ActionDefinitions<LogicType extends Logic> =
  | Record<string, any | ((...args: any[]) => any)>
  | LogicType['actionCreators']

export interface KeaReduxAction extends AnyAction {
  type: string
  payload?: any
}

export interface KeaAction {
  (...args: any[]): KeaReduxAction
  _isKeaAction: boolean
  toString(): string
}

export type ReducerActions<LogicType extends Logic, ReducerType> = {
  [K in keyof LogicType['actionCreators']]?: (
    state: ReducerType,
    payload: ReturnType<LogicType['actionCreators'][K]>['payload'],
  ) => ReducerType
} & {
  [K in keyof LogicType['__keaTypeGenInternalReducerActions']]?: (
    state: ReducerType,
    payload: ReturnType<LogicType['__keaTypeGenInternalReducerActions'][K]>['payload'],
  ) => ReducerType
}

export type ReducerDefault<Reducer extends () => any, P extends Props> =
  | ReturnType<Reducer>
  | ((state: any, props: P) => ReturnType<Reducer>)

export type ReducerDefinitions<LogicType extends Logic> = {
  [K in keyof LogicType['reducers']]?:
    | [
        ReducerDefault<LogicType['reducers'][K], LogicType['props']>,
        ReducerActions<LogicType, ReturnType<LogicType['reducers'][K]>>,
      ]
    | [ReducerDefault<LogicType['reducers'][K], LogicType['props']>]
    | ReducerActions<LogicType, ReturnType<LogicType['reducers'][K]>>
}

export type ReducerFunction<S = any> = (state: S, action: KeaReduxAction, fullState: any) => S

export type SelectorTuple =
  | []
  | [Selector]
  | [Selector, Selector]
  | [Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector]

export type SelectorDefinition<Selectors, SelectorFunction extends any> =
  | [(s: Selectors) => SelectorTuple, SelectorFunction]
  | [(s: Selectors) => SelectorTuple, SelectorFunction, any]

export type SelectorDefinitions<LogicType extends Logic> =
  | {
      [K in keyof LogicType['__keaTypeGenInternalSelectorTypes']]?: SelectorDefinition<
        LogicType['selectors'],
        LogicType['__keaTypeGenInternalSelectorTypes'][K]
      >
    }
  | {
      [key: string]: SelectorDefinition<LogicType['selectors'], any>
    }

export type BreakPointFunction = (() => void) & ((ms: number) => Promise<void>)

export type ListenerDefinitionsForRecord<A extends Record<string, (...args: any) => any>> = {
  [K in keyof A]?: ListenerFunction<ReturnType<A[K]>> | ListenerFunction<ReturnType<A[K]>>[]
}

export type ListenerDefinitions<LogicType extends Logic> = ListenerDefinitionsForRecord<LogicType['actionCreators']> &
  ListenerDefinitionsForRecord<LogicType['__keaTypeGenInternalReducerActions']>

export type ListenerFunction<A extends AnyAction = any> = (
  payload: A['payload'],
  breakpoint: BreakPointFunction,
  action: A,
  previousState: any,
) => void | Promise<void>

export type ListenerFunctionWrapper = (action: any, previousState: any) => void

export type SharedListenerDefinitions = Record<string, ListenerFunction>

type WindowValuesDefinitions<LogicType extends Logic> = Record<string, (window: Window) => any>

type LoaderFunctions<LogicType extends Logic, ReducerReturnType> = {
  [K in keyof LogicType['actionCreators']]?: (
    payload: ReturnType<LogicType['actionCreators'][K]>['payload'],
    breakpoint: BreakPointFunction,
    action: ReturnType<LogicType['actionCreators'][K]>,
  ) => ReducerReturnType | Promise<ReducerReturnType>
}

type LoaderDefinitions<LogicType extends Logic> = {
  [K in keyof LogicType['reducers']]?:
    | (
        | LoaderFunctions<LogicType, ReturnType<LogicType['reducers'][K]>>
        | {
            __default: ReturnType<LogicType['reducers'][K]>
          }
      )
    | [ReturnType<LogicType['reducers'][K]>, LoaderFunctions<LogicType, ReturnType<LogicType['reducers'][K]>>]
}

export type LogicInput<LogicType extends Logic = Logic> = {
  inherit?: LogicWrapper[]
  extend?: LogicInput[]
  key?: (props: LogicType['props']) => KeyType
  path?: PathType | ((key: KeyType) => PathType)
  connect?: any | ((props: LogicType['props']) => any)
  constants?: (logic: LogicType) => string[] | string[]
  actions?: ActionDefinitions<LogicType> | ((logic: LogicType) => ActionDefinitions<LogicType>)
  reducers?: ReducerDefinitions<LogicType> | ((logic: LogicType) => ReducerDefinitions<LogicType>)
  selectors?: SelectorDefinitions<LogicType> | ((logic: LogicType) => SelectorDefinitions<LogicType>)
  listeners?: ListenerDefinitions<LogicType> | ((logic: LogicType) => ListenerDefinitions<LogicType>)
  sharedListeners?: SharedListenerDefinitions | ((logic: LogicType) => SharedListenerDefinitions)
  events?:
    | PartialRecord<LogicEventType, (() => void) | (() => void)[]>
    | ((logic: LogicType) => PartialRecord<LogicEventType, (() => void) | (() => void)[]>)
  defaults?:
    | ((logic: LogicType) => (state: any, props: LogicType['props']) => Record<string, any>)
    | ((logic: LogicType) => Record<string, any>)
    | Record<string, any>

  // plugins
  loaders?: LoaderDefinitions<LogicType> | ((logic: LogicType) => LoaderDefinitions<LogicType>)
  windowValues?: WindowValuesDefinitions<LogicType> | ((logic: LogicType) => WindowValuesDefinitions<LogicType>)
  urlToAction?: (logic: LogicType) => Record<
    string,
    (
      params: Record<string, string | undefined>,
      searchParams: Record<string, any>,
      hashParams: Record<string, any>,
      payload: {
        method: 'PUSH' | 'REPLACE' | 'POP'
        pathname: string
        search: string
        searchParams: Record<string, any>
        hash: string
        hashParams: Record<string, any>
        url: string
        initial?: boolean
      },
      previousLocation: {
        method: 'PUSH' | 'REPLACE' | 'POP' | null
        pathname: string
        search: string
        searchParams: Record<string, any>
        hash: string
        hashParams: Record<string, any>
        url: string
      },
    ) => any
  >
  actionToUrl?: (logic: LogicType) => {
    [K in keyof LogicType['actionCreators']]?: (
      payload: Record<string, any>,
    ) =>
      | void
      | string
      | [string]
      | [string, string | Record<string, any> | undefined]
      | [string, string | Record<string, any> | undefined, string | Record<string, any> | undefined]
      | [
          string,
          string | Record<string, any> | undefined,
          string | Record<string, any> | undefined,
          { replace?: boolean },
        ]
  }

  [key: string]: unknown
} & LogicType['__keaTypeGenInternalExtraInput']

/**
  MakeLogicType:
  - create a close-enough approximation of the logic's types if passed three interfaces:

  MakeLogicType<Values, Actions, Props>
  - Values = { valueKey: type }
  - Actions = { actionKey: (id) => void }   // <- this works
  - Actions = { actionKey: (id) => { id } } // <- adds type completion in reducers
  - Props = { id: 3 }
*/
export interface MakeLogicType<
  Values = Record<string, unknown>,
  Actions = Record<string, AnyFunction>,
  LogicProps = Props,
> extends Logic {
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
  defaults: Values
  props: LogicProps
  reducer: ReducerFunction<Values>
  reducers: {
    [Value in keyof Values]: ReducerFunction<Values[Value]>
  }
  selector: (state: any, props: LogicProps) => Values
  selectors: {
    [Value in keyof Values]: (state: any, props: LogicProps) => Values[Value]
  }
  values: Values

  __keaTypeGenInternalSelectorTypes: {
    [K in keyof Values]: (...args: any) => Values[K]
  }
}
export type AnyFunction = (...args: any) => any

export type ActionCreatorForPayloadBuilder<B extends AnyFunction> = (...args: Parameters<B>) => {
  type: string
  payload: ReturnType<B>
}

export type ActionForPayloadBuilder<B extends AnyFunction> = (...args: Parameters<B>) => void

// kea setup stuff

export interface CreateStoreOptions {
  paths: string[]
  reducers: Record<string, Reducer>
  preloadedState: Record<string, any> | undefined
  middleware: Middleware[]
  compose: typeof compose
  enhancers: StoreEnhancer[]
  plugins: KeaPlugin[]
}

export interface InternalContextOptions {
  debug: boolean
  proxyFields: boolean
  flatDefaults: boolean
  attachStrategy: 'dispatch' | 'replace'
  detachStrategy: 'dispatch' | 'replace' | 'persist'
  defaultPath: string[]
  // ...otherOptions
}

export interface ContextOptions extends Partial<InternalContextOptions> {
  plugins?: KeaPlugin[]
  createStore?: boolean | Partial<CreateStoreOptions>
  defaults?: Record<string, any>
}

export interface KeaComponent extends FunctionComponent {
  _wrapper: LogicWrapper
  _wrappedComponent: AnyComponent
}

export interface PluginEvents {
  afterOpenContext?: (context: Context, options: ContextOptions) => void
  afterPlugin?: () => void
  beforeReduxStore?: (options: CreateStoreOptions) => void
  afterReduxStore?: (options: CreateStoreOptions, store: Store) => void
  beforeKea?: (input: LogicInput | LogicBuilder) => void
  beforeBuild?: (logic: BuiltLogic, inputs: (LogicInput | LogicBuilder)[]) => void
  beforeLogic?: (logic: BuiltLogic, input: LogicInput | LogicBuilder) => void
  afterLogic?: (logic: BuiltLogic, input: LogicInput | LogicBuilder) => void
  legacyBuild?: (logic: BuiltLogic, input: LogicInput | LogicBuilder) => void
  afterBuild?: (logic: BuiltLogic, inputs: (LogicInput | LogicBuilder)[]) => void
  beforeMount?: (logic: BuiltLogic) => void
  afterMount?: (logic: BuiltLogic) => void
  beforeAttach?: (logic: BuiltLogic) => void
  afterAttach?: (logic: BuiltLogic) => void
  beforeUnmount?: (logic: BuiltLogic) => void
  afterUnmount?: (logic: BuiltLogic) => void
  beforeDetach?: (logic: BuiltLogic) => void
  afterDetach?: (logic: BuiltLogic) => void
  beforeWrap?: (wrapper: LogicWrapper, Klass: AnyComponent) => void
  afterWrap?: (wrapper: LogicWrapper, Klass: AnyComponent, Kea: KeaComponent) => void
  beforeRender?: (logic: BuiltLogic, props: Props) => void
  beforeCloseContext?: (context: Context) => void
}

export type PluginEventArrays = {
  [K in keyof PluginEvents]: PluginEvents[K][]
}

export interface KeaPlugin {
  name: string
  defaults?: () => Record<string, any>
  events?: PluginEvents
}

export interface WrapperContext<L extends Logic = Logic> {
  isBuilding: boolean
  keyBuilder: L['keyBuilder']
  builtLogics: Map<KeyType | undefined, BuiltLogic<L>>
}

export interface Context {
  contextId: string

  plugins: {
    activated: KeaPlugin[]
    events: PluginEventArrays
    logicFields: Record<string, string>
    contexts: Record<string, Record<string, any>>
  }

  inputCounter: number
  reducerDefaults: Record<string, any> | undefined
  wrapperContexts: WeakMap<LogicWrapper, WrapperContext>
  buildHeap: Logic[]

  mount: {
    counter: Record<string, number>
    mounted: Record<string, BuiltLogic>
  }

  react: {
    contexts: WeakMap<LogicWrapper, ReactContext<BuiltLogic | undefined>>
  }

  reducers: {
    tree: any
    roots: any
    redux: any
    whitelist: false | Record<string, boolean>
    combined: ReducerFunction | undefined
  }

  // getter that always returns something
  store: Store
  // the created store if present
  __store: Store | undefined

  options: InternalContextOptions
}
