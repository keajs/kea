import { Reducer, Store, Action as ReduxAction } from 'redux'
import { ComponentType, FunctionComponent } from 'react'

// universal helpers
export type AnyComponent = ComponentType | FunctionComponent
export type Selector = (state?: any, props?: any) => any
export type PathCreator = (key?: string) => string[]
export type Props = Record<string, any>

// logic base class
export interface Logic {
  key: any
  path: string[]
  pathString: string
  props: Props
  cache: Record<string, any>
  connections: { [pathString: string]: BuiltLogic }
  constants: Record<string, string>
  actionCreators: any
  actionKeys: Record<string, string>
  actions: any
  defaults: Record<string, any>
  reducers: any
  reducerOptions: Record<string, any>
  reducer: undefined
  selector?: Selector
  selectors: Record<string, Selector>
  values: Record<string, any>
  propTypes: unknown
  events: {
    beforeMount?: () => void
    afterMount?: () => void
    beforeUnmount?: () => void
    afterUnmount?: () => void
  }
}

export interface BuiltLogic<LogicType extends Logic = Logic> extends LogicType {
  _isKeaBuild: boolean
  mount(callback?: any): () => void
}

export interface LogicWrapper<LogicType extends Logic = Logic> extends LogicType {
  _isKea: boolean
  _isKeaWithKey: boolean
  inputs: (LogicInput | LogicInput<LogicType>)[]
  (params: AnyComponent): FunctionComponent
  (params: Props | undefined): BuiltLogic<LogicType>
  wrap: (Component: AnyComponent) => KeaComponent
  build: (props?: Props, autoConnectInListener?: boolean) => BuiltLogic<LogicType>
  mount: (callback?: any) => () => void
  extend: (extendedInput: LogicInput) => LogicWrapper<LogicType>
}

// input helpers (using the kea-typegen generated logic type as input)

type ActionDefinitions<LogicType extends Logic> = Record<string, any | (() => any)>

type ReducerActions<LogicType extends Logic, ReducerType> = {
  [K in keyof LogicType['actions']]?: (
    state: ReducerType,
    payload: ReturnType<LogicType['actions'][K]>['payload'],
  ) => ReducerType
}
type ReducerDefinitions<LogicType extends Logic> = {
  [K in keyof LogicType['reducers']]?:
    | [ReturnType<LogicType['reducers'][K]>, any, any, ReducerActions<LogicType, ReturnType<LogicType['reducers'][K]>>]
    | [ReturnType<LogicType['reducers'][K]>, any, ReducerActions<LogicType, ReturnType<LogicType['reducers'][K]>>]
    | [ReturnType<LogicType['reducers'][K]>, ReducerActions<LogicType, ReturnType<LogicType['reducers'][K]>>]
    | [ReturnType<LogicType['reducers'][K]>]
    | ReducerActions<LogicType, ReturnType<LogicType['reducers'][K]>>
}

type SelectorDefinition<Selectors, S extends Selector, SelectorFunction extends any> = [
  (
    s: Selectors,
  ) =>
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
    | [Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector],
  SelectorFunction,
]

type SelectorDefinitions<LogicType extends Logic> = {
  [K in keyof LogicType['selectors']]?: SelectorDefinition<
    LogicType['selectors'],
    LogicType['selectors'][K],
    LogicType['__selectorTypeHelp'][K]
  >
}

type ListenerDefinitions<LogicType extends Logic> = {
  [K in keyof LogicType['actions']]?:
    | ((
        payload: ReturnType<LogicType['actions'][K]>['payload'],
        breakpoint: (() => void) | ((ms: number) => Promise<void>),
        action: ReturnType<LogicType['actions'][K]>,
        previousState: any,
      ) => void | Promise<void>)
    | (() => void | Promise<void>)
}

export type LogicInput<LogicType extends Logic = Logic> = {
  extend?: LogicInput[]
  key?: (props: Props) => string
  path?: PathCreator | string[]

  connect?: any
  constants?: () => string[] | string[]
  actions?: ActionDefinitions<LogicType> | ((logic: LogicType) => ActionDefinitions<LogicType>)
  reducers?: ReducerDefinitions<LogicType> | ((logic: LogicType) => ReducerDefinitions<LogicType>)
  selectors?: SelectorDefinitions<LogicType> | ((logic: LogicType) => SelectorDefinitions<LogicType>)
  listeners?: ListenerDefinitions<LogicType> | ((logic: LogicType) => ListenerDefinitions<LogicType>)
  events?:
    | {
        beforeMount?: () => void
        afterMount?: () => void
        beforeUnmount?: () => void
        afterUnmount?: () => void
      }
    | ((
        logic: LogicType,
      ) => {
        beforeMount?: () => void
        afterMount?: () => void
        beforeUnmount?: () => void
        afterUnmount?: () => void
      })
  defaults?: any

  // what to do with plugins?
  loaders?: any
  urlToAction?: any
  actionToUrl?: any
  windowValues?: any
}

// kea setup stuff

interface CreateStoreOptions {
  paths?: string[]
  reducers?: Record<string, Reducer>
  preloadedState?: undefined
  middleware?: []
  compose?: reduxDevToolsCompose
  enhancers?: []
  plugins?: []
}

interface ContextOptions {
  plugins?: any[]
  createStore?: boolean | CreateStoreOptions
  defaults?: object
  skipPlugins?: string[]
}

type BuildStep = (logic: Logic, input: Input) => void

interface KeaComponent extends FunctionComponent {
  _wrapper: LogicWrapper
  _wrappedComponent: FunctionComponent | Component
}

interface PluginEvents {
  afterOpenContext?: (context: Context, options: ContextOptions) => void
  afterPlugin?: () => void
  beforeReduxStore?: (options: CreateStoreOptions) => void
  afterReduxStore?: (options: CreateStoreOptions, store: Store) => void
  beforeKea?: (input: Input) => void
  beforeBuild?: (logic: Logic, inputs: Input[]) => void
  beforeLogic?: (logic: Logic, input: Input) => void
  afterLogic?: (logic: Logic, input: Input) => void
  afterBuild?: (logic: Logic, inputs: Input[]) => void
  beforeMount?: (logic: Logic) => void
  afterMount?: (logic: Logic) => void
  beforeAttach?: (logic: Logic) => void
  afterAttach?: (logic: Logic) => void
  beforeUnmount?: (logic: Logic) => void
  afterUnmount?: (logic: Logic) => void
  beforeDetach?: (logic: Logic) => void
  afterDetach?: (logic: Logic) => void
  beforeWrapper?: (input: Input, Klass: AnyComponent) => void
  afterWrapper?: (input: Input, Klass: AnyComponent, Kea) => void
  beforeRender?: (logic: Logic, props) => void
  beforeCloseContext?: (context: Context) => void
}

interface Plugin {
  name: string
  defaults?: () => Record<string, any>
  buildOrder?: Record<string, { before?: string; after?: string }>
  buildSteps?: Record<string, BuildStep>
  events?: PluginEvents
}

interface Context {
  plugins: {
    activated: Plugin[]
    buildOrder: string[]
    buildSteps: Record<string, BuildStep[]>
    events: {
      [K in keyof PluginEvents]: PluginEvents[K][]
    }
    logicFields: Record<string, string>
    contexts: Record<string, Record<string, any>>
  }

  input: {
    inlinePathCreators: Map<Input, PathCreator>
    inlinePathCounter: number
    defaults: object | undefined
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
    heap: { action?: ReduxAction; type: 'action' | 'listener'; logic: BuiltLogic }[]
  }

  reducers: {
    tree: {}
    roots: {}
    redux: {}
    whitelist: boolean
    combined: undefined
  }

  store?: Store

  options: {
    debug: boolean
    autoMount: boolean
    autoConnect: boolean
    proxyFields: boolean
    flatDefaults: boolean
    attachStrategy: 'dispatch' | 'replace'
    detachStrategy: 'dispatch' | 'replace' | 'persist'
    // ...otherOptions
  }
}
