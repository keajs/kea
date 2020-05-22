import { Reducer, Store, Action as ReduxAction } from 'redux'
import { Component, FunctionComponent } from 'react'

export type PathCreator = (key: string | undefined) => string[]

export interface Input {
  extend?: Input[]
  key?: (props: object) => string
  path?: PathCreator
  connect?: InputConnect
}

export type InputConnect = []

export type Props = object

export interface LogicWrapper {
  _isKea: boolean
  _isKeaWithKey: boolean
  inputs: Input[]
  wrap: (Component: Component | FunctionComponent) => FunctionComponent
  build: (props?: object, autoConnectInListener?: boolean) => Logic
  mount: (callback?: any) => () => void
  extend: (extendedInput: Input) => LogicWrapper
}

export interface Logic {
  cache: {}
  connections: { [pathString: string]: Logic }
  constants: {}
  actionCreators: {}
  actionKeys: {}
  actions: {}
  defaults: {}
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
  beforeWrapper?: (input: Input, Klass) => void
  afterWrapper?: (input: Input, Klass, Kea) => void
  beforeRender?: (logic: Logic, props) => void
  beforeCloseContext?: (context: Context) => void
}

interface Plugin {
  name: string
  defaults?: () => Record<string, any>
  buildOrder?: Record<string, { [key in 'before' | 'after']: string }>
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
