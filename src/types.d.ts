import { Reducer, Store, Action as ReduxAction } from 'redux'
import { ComponentType, FunctionComponent } from 'react'

export type AnyComponent = ComponentType | FunctionComponent

export type PathCreator = (key?: string) => string[]

export type Props = Record<string, any>

export type InputConnect = []

export interface Input {
  extend?: Input[]
  key?: (props: Props) => string
  path?: PathCreator

  connect?: InputConnect
  actions?: () => any | Record<string, any>
  constants?: () => string[]
  defaults?: any
  events?: {
    beforeMount?: () => void
    afterMount?: () => void
    beforeUnmount?: () => void
    afterUnmount?: () => void
  }
  reducers?: any
  selectors?: any
}

export interface LogicWrapper<I extends Input = Input> {
  _isKea: boolean
  _isKeaWithKey: boolean
  inputs: [I]
  (params: AnyComponent): FunctionComponent
  (params: Props | undefined): Logic<I>
  wrap: (Component: AnyComponent) => FunctionComponent
  build: (props?: Props, autoConnectInListener?: boolean) => Logic<I>
  mount: (callback?: any) => () => void
  extend: (extendedInput: Input) => LogicWrapper
}

export type ActionCreatorForPayloadBuilder<B extends any> = () => { type: string; payload: B }

export type ActionCreatorForPayloadValue<
  B extends (...any) => any,
  P extends Parameters<B>,
  R extends ReturnType<B>
> = (...P) => { type: string; payload: { value: R } }

export type ActionsCreatorsForInput<
  I extends Input,
  Actions extends ReturnType<I['actions']> = ReturnType<I['actions']>
> = {
  [K in keyof Actions]: Actions[K] extends (...any) => any
    ? ActionCreatorForPayloadBuilder<Actions[K]>
    : ActionCreatorForPayloadValue<Actions[K]>
}

export interface Logic<I extends Input = Input> {
  cache: Record<string, any>
  connections: { [pathString: string]: Logic }
  constants: {}
  actionCreators: ActionsCreatorsForInput<I>
  actionKeys: Record<string, string>
  actions: ActionsCreatorsForInput<I>
  defaults: I
  reducers: {}
  reducerOptions: {}
  reducer: undefined
  selector: undefined
  selectors: {}
  values: {}
  propTypes: {}
  events: {
    beforeMount?: () => void
    afterMount?: () => void
    beforeUnmount?: () => void
    afterUnmount?: () => void
  }

  _isKeaBuild: boolean

  key: true
  path: string[]
  pathString: string
  props: Record<string, any>
  wrapper: LogicWrapper

  wrap: true
  // build(): void
  mount(callback?: any): () => void
  extend(input: Input): void
}

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
    cache: Record<string, Logic>
    heap: Logic[]
  }

  mount: {
    counter: Record<string, number>
    mounted: Record<string, Logic>
  }

  run: {
    heap: { action?: ReduxAction; type: 'action' | 'listener'; logic: Logic }[]
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
