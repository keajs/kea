import { Reducer, Store, Action as ReduxAction } from 'redux'
import { ComponentType, FunctionComponent } from 'react'

// universal helpers
export type AnyComponent = ComponentType | FunctionComponent
export type Selector = (state?: any, props?: any) => any
export type PathCreator = (key?: string) => string[]
export type Props = Record<string, any> // nb! used in kea and react

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
  actionTypes: Record<string, string>
  actions: any
  defaults: Record<string, any>
  reducers: any
  reducerOptions: Record<string, any>
  reducer: any
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

  __keaTypeGenInternalSelectorTypes?: Record<string, (...args: any) => any>
  __keaTypeGenInternalReducerActions?: Record<string, (...args: any) => any>
}

export interface BuiltLogicAdditions {
  _isKeaBuild: boolean
  mount(callback?: any): () => void
}

export interface LogicWrapperAdditions {
  _isKea: boolean
  _isKeaWithKey: boolean
  inputs: LogicInput[]
  (params: AnyComponent): FunctionComponent
  (params: Props | undefined): BuiltLogic
  wrap: (Component: AnyComponent) => KeaComponent
  build: (props?: Props, autoConnectInListener?: boolean) => BuiltLogic
  mount: (callback?: any) => () => void
  extend: (extendedInput: LogicInput) => LogicWrapper
}

export type BuiltLogic = Logic & BuiltLogicAdditions
export type LogicWrapper = Logic & LogicWrapperAdditions

// input helpers (using the kea-typegen generated logic type as input)

type ActionDefinitions<LogicType extends Logic> = Record<string, any | (() => any)>

type ReducerActions<LogicType extends Logic, ReducerType> =
  | {
      [K in keyof LogicType['actions']]?: (
        state: ReducerType,
        payload: ReturnType<LogicType['actions'][K]>['payload'],
      ) => ReducerType
    }
  | {
      [K in keyof LogicType['__keaTypeGenInternalReducerActions']]?: (
        state: ReducerType,
        payload: ReturnType<LogicType['__keaTypeGenInternalReducerActions'][K]>['payload'],
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
    LogicType['__keaTypeGenInternalSelectorTypes'][K]
  >
}

type BreakPointFunction = (() => void) & ((ms: number) => Promise<void>)

type ListenerDefinitions<LogicType extends Logic> =
  | {
      [K in keyof LogicType['actions']]?:
        | ((
            payload: ReturnType<LogicType['actions'][K]>['payload'],
            breakpoint: BreakPointFunction,
            action: ReturnType<LogicType['actions'][K]>,
            previousState: any,
          ) => void | Promise<void>)
        | (() => void | Promise<void>)
    }
  | {
      [K in keyof LogicType['__keaTypeGenInternalReducerActions']]?:
        | ((
            payload: ReturnType<LogicType['__keaTypeGenInternalReducerActions'][K]>['payload'],
            breakpoint: BreakPointFunction,
            action: ReturnType<LogicType['__keaTypeGenInternalReducerActions'][K]>,
            previousState: any,
          ) => void | Promise<void>)
        | (() => void | Promise<void>)
    }

type WindowValuesDefinitions<LogicType extends Logic> = Record<string, (window: Window) => any>

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
  loaders?: any // LoaderDefinitions<LogicType> | ((logic: LogicType) => LoaderDefinitions<LogicType>)
  urlToAction?: any
  actionToUrl?: any
  windowValues?: WindowValuesDefinitions<LogicType> | ((logic: LogicType) => WindowValuesDefinitions<LogicType>)

  [key: string]: unknown
}

// kea setup stuff

interface CreateStoreOptions {
  paths?: string[]
  reducers?: Record<string, Reducer>
  preloadedState?: undefined
  middleware?: []
  compose?: () => any
  enhancers?: []
  plugins?: []
}

export interface ContextOptions {
  plugins?: any[]
  createStore?: boolean | CreateStoreOptions
  defaults?: Record<string, any>
  skipPlugins?: string[]
}

type BuildStep = (logic: Logic, input: LogicInput) => void

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
  beforeBuild?: (logic: Logic, inputs: LogicInput[]) => void
  beforeLogic?: (logic: Logic, input: LogicInput) => void
  afterLogic?: (logic: Logic, input: LogicInput) => void
  afterBuild?: (logic: Logic, inputs: LogicInput[]) => void
  beforeMount?: (logic: Logic) => void
  afterMount?: (logic: Logic) => void
  beforeAttach?: (logic: Logic) => void
  afterAttach?: (logic: Logic) => void
  beforeUnmount?: (logic: Logic) => void
  afterUnmount?: (logic: Logic) => void
  beforeDetach?: (logic: Logic) => void
  afterDetach?: (logic: Logic) => void
  beforeWrapper?: (input: LogicInput, Klass: AnyComponent) => void
  afterWrapper?: (input: LogicInput, Klass: AnyComponent, Kea: KeaComponent) => void
  beforeRender?: (logic: Logic, props: Props) => void
  beforeCloseContext?: (context: Context) => void
}

export type PluginEventArrays = {
  [K in keyof PluginEvents]: PluginEvents[K][]
}

export interface Plugin {
  name: string
  defaults?: () => Record<string, any>
  buildOrder?: Record<string, { before?: string; after?: string }>
  buildSteps?: Record<string, BuildStep>
  events?: PluginEvents
}

export interface Context {
  plugins: {
    activated: Plugin[]
    buildOrder: string[]
    buildSteps: Record<string, BuildStep[]>
    events: PluginEventArrays
    logicFields: Record<string, string>
    contexts: Record<string, Record<string, any>>
  }

  input: {
    inlinePathCreators: Map<LogicInput, PathCreator>
    inlinePathCounter: number
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
    heap: { action?: ReduxAction; type: 'action' | 'listener'; logic: BuiltLogic }[]
  }

  reducers: {
    tree: any
    roots: any
    redux: any
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
