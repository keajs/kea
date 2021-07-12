import { Reducer, Store, Action as ReduxAction, Middleware, StoreEnhancer, compose, AnyAction } from 'redux'
import { Context as ReactContext, ComponentType, FunctionComponent } from 'react'

// universal helpers
export type AnyComponent = ComponentType | FunctionComponent
export type Selector = (state?: any, props?: any) => any
export type RequiredPathCreator<T = string> = (key: T) => PathType
export type PathCreator<T = string> = (key?: T) => PathType
export type PathType = (string | number | boolean)[]
export type Props = Record<string, any> // nb! used in kea and react
export type LogicEventType = 'beforeMount' | 'afterMount' | 'beforeUnmount' | 'afterUnmount'
export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>

// logic base class
export interface Logic {
  key: any
  actionCreators: Record<string, any>
  actionKeys: Record<string, string>
  actionTypes: Record<string, string>
  actions: Record<string, any>
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
  __keaTypeGenInternalExtraInput: Record<string, any>
}

export interface BuiltLogicAdditions<LogicType extends Logic> {
  _isKeaBuild: boolean
  mount(callback?: (logic: LogicType) => any): () => void
  extend: <ExtendLogicType extends Logic = LogicType>(
    extendedInput: LogicInput<ExtendLogicType>,
  ) => ExtendLogicType & LogicWrapperAdditions<ExtendLogicType>
  wrapper: LogicWrapper
}

export interface LogicWrapperAdditions<LogicType extends Logic> {
  _isKea: boolean
  _isKeaWithKey: boolean
  inputs: LogicInput[]
  <T extends LogicType['props'] | AnyComponent>(props: T): T extends LogicType['props']
    ? LogicType & BuiltLogicAdditions<LogicType>
    : FunctionComponent
  (): LogicType & BuiltLogicAdditions<LogicType>
  wrap: (Component: AnyComponent) => KeaComponent
  build: (props?: LogicType['props'], autoConnectInListener?: boolean) => LogicType & BuiltLogicAdditions<LogicType>
  mount: (callback?: any) => () => void
  extend: <ExtendLogicType extends Logic = LogicType>(
    extendedInput: LogicInput<ExtendLogicType>,
  ) => ExtendLogicType & LogicWrapperAdditions<ExtendLogicType>
}

export type BuiltLogic<LogicType extends Logic = Logic> = LogicType & BuiltLogicAdditions<LogicType>
export type LogicWrapper<LogicType extends Logic = Logic> = LogicType & LogicWrapperAdditions<LogicType>

// input helpers (using the generated logic type as input)

type ActionDefinitions<LogicType extends Logic> = Record<string, any | (() => any)> | LogicType['actionCreators']

type ReducerActions<LogicType extends Logic, ReducerType> = {
  [K in keyof LogicType['actionCreators']]?: (
    state: ReducerType,
    payload: ReturnType<LogicType['actionCreators'][K]>['payload'],
  ) => ReducerType
} &
  {
    [K in keyof LogicType['__keaTypeGenInternalReducerActions']]?: (
      state: ReducerType,
      payload: ReturnType<LogicType['__keaTypeGenInternalReducerActions'][K]>['payload'],
    ) => ReducerType
  }

type ReducerDefault<Reducer extends () => any, P extends Props> =
  | ReturnType<Reducer>
  | ((state: any, props: P) => ReturnType<Reducer>)

type ReducerDefinitions<LogicType extends Logic> = {
  [K in keyof LogicType['reducers']]?:
    | [
        ReducerDefault<LogicType['reducers'][K], LogicType['props']>,
        any,
        any,
        ReducerActions<LogicType, ReturnType<LogicType['reducers'][K]>>,
      ]
    | [
        ReducerDefault<LogicType['reducers'][K], LogicType['props']>,
        any,
        ReducerActions<LogicType, ReturnType<LogicType['reducers'][K]>>,
      ]
    | [
        ReducerDefault<LogicType['reducers'][K], LogicType['props']>,
        ReducerActions<LogicType, ReturnType<LogicType['reducers'][K]>>,
      ]
    | [ReducerDefault<LogicType['reducers'][K], LogicType['props']>]
    | ReducerActions<LogicType, ReturnType<LogicType['reducers'][K]>>
}

export type ReducerFunction<S = any> = (state: S, action: AnyAction, fullState: any) => S

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

type SelectorDefinitions<LogicType extends Logic> =
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

type ListenerDefinitionsForRecord<A extends Record<string, (...args: any) => any>> = {
  [K in keyof A]?: ListenerFunction<ReturnType<A[K]>> | ListenerFunction<ReturnType<A[K]>>[]
}

type ListenerDefinitions<LogicType extends Logic> = ListenerDefinitionsForRecord<LogicType['actionCreators']> &
  ListenerDefinitionsForRecord<LogicType['__keaTypeGenInternalReducerActions']>

export type ListenerFunction<A extends AnyAction = any> = (
  payload: A['payload'],
  breakpoint: BreakPointFunction,
  action: A,
  previousState: any,
) => void | Promise<void>

export type ListenerFunctionWrapper = (action: any, previousState: any) => void

type SharedListenerDefinitions = Record<string, ListenerFunction>

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
  key?: (props: LogicType['props']) => any
  path?:
    | (LogicType['key'] extends undefined ? PathCreator<LogicType['key']> : RequiredPathCreator<LogicType['key']>)
    | PathType
  connect?: any
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
  urlToAction?: (
    logic: LogicType,
  ) => Record<
    string,
    (
      params: Record<string, string | undefined>,
      searchParams: Record<string, any>,
      hashParams: Record<string, any>,
    ) => any
  >
  actionToUrl?: (
    logic: LogicType,
  ) => {
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

// MakeLogicType:
// - create a close-enough approximation of the logic's types if passed two interfaces:
//
// MakeLogicType<Values, Actions>
// - Values = { valueKey: type }
// - Actions = { actionKey: (id) => void }   // <- this works
// - Actions = { actionKey: (id) => { id } } // <- adds type completion in reducers
export interface MakeLogicType<
  Values = Record<string, unknown>,
  Actions = Record<string, AnyFunction>,
  LogicProps = Props
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
type AnyFunction = (...args: any) => any

type ActionCreatorForPayloadBuilder<B extends AnyFunction> = (
  ...args: Parameters<B>
) => { type: string; payload: ReturnType<B> }

type ActionForPayloadBuilder<B extends AnyFunction> = (...args: Parameters<B>) => void

// kea setup stuff

export interface CreateStoreOptions {
  paths: string[]
  reducers: Record<string, Reducer>
  preloadedState: undefined
  middleware: Middleware[]
  compose: typeof compose
  enhancers: StoreEnhancer[]
  plugins: KeaPlugin[]
}

export interface InternalContextOptions {
  debug: boolean
  autoMount: boolean
  autoConnect: boolean
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
  skipPlugins?: string[]
}

type BuildStep = (logic: BuiltLogic, input: LogicInput) => void

export interface KeaComponent extends FunctionComponent {
  _wrapper: LogicWrapper
  _wrappedComponent: AnyComponent
}

export interface PluginEvents {
  afterOpenContext?: (context: Context, options: ContextOptions) => void
  afterPlugin?: () => void
  beforeReduxStore?: (options: CreateStoreOptions) => void
  afterReduxStore?: (options: CreateStoreOptions, store: Store) => void
  beforeKea?: (input: LogicInput) => void
  beforeBuild?: (logic: BuiltLogic, inputs: LogicInput[]) => void
  beforeLogic?: (logic: BuiltLogic, input: LogicInput) => void
  afterLogic?: (logic: BuiltLogic, input: LogicInput) => void
  afterBuild?: (logic: BuiltLogic, inputs: LogicInput[]) => void
  beforeMount?: (logic: BuiltLogic) => void
  afterMount?: (logic: BuiltLogic) => void
  beforeAttach?: (logic: BuiltLogic) => void
  afterAttach?: (logic: BuiltLogic) => void
  beforeUnmount?: (logic: BuiltLogic) => void
  afterUnmount?: (logic: BuiltLogic) => void
  beforeDetach?: (logic: BuiltLogic) => void
  afterDetach?: (logic: BuiltLogic) => void
  beforeWrapper?: (input: LogicInput, Klass: AnyComponent) => void
  afterWrapper?: (input: LogicInput, Klass: AnyComponent, Kea: KeaComponent) => void
  beforeRender?: (logic: BuiltLogic, props: Props) => void
  beforeCloseContext?: (context: Context) => void
}

export type PluginEventArrays = {
  [K in keyof PluginEvents]: PluginEvents[K][]
}

export interface KeaPlugin {
  name: string
  defaults?: () => Record<string, any>
  buildOrder?: Record<string, { before?: string; after?: string }>
  buildSteps?: Record<string, BuildStep>
  events?: PluginEvents
}

export interface Context {
  plugins: {
    activated: KeaPlugin[]
    buildOrder: string[]
    buildSteps: Record<string, BuildStep[]>
    events: PluginEventArrays
    logicFields: Record<string, string>
    contexts: Record<string, Record<string, any>>
  }

  input: {
    logicPathCreators: Map<LogicInput, PathCreator<any>>
    logicPathCounter: number
    defaults: Record<string, any> | undefined
  }

  build: {
    cache: Record<string, BuiltLogic>
    heap: Logic[]
  }

  mount: {
    counter: Record<string, number>
    mounted: Record<string, BuiltLogic>
  }

  run: {
    heap: { action?: ReduxAction; type: 'action' | 'listener'; logic: Logic }[]
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
