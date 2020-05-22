import { Reducer, Store, Action as ReduxAction } from 'redux'

export type PathCreator = (key: string | undefined) => string[]

export interface Input {
  extend?: Input[]
  key?: (props: object) => string
  path?: PathCreator
}

export type Props = object

export interface Wrapper {}

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
  events: {}

  _isKeaBuild: boolean

  key: true
  path: string[]
  pathString: string
  props: object
  wrapper: Wrapper

  wrap: true
  // build(): void
  mount(callback: any): void
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

interface Plugin {
  name: string
  defaults?: () => Record<string, any>
  buildOrder?: Record<string, { before: string } | { after: string }>
  buildSteps?: Record<string, BuildStep>

  events?: {
    afterOpenContext?: (context: Context, options: ContextOptions) => void
    afterPlugin?: () => void
    beforeReduxStore?: (options: CreateStoreOptions) => void
    afterReduxStore?: (options: CreateStoreOptions, store: Store) => void
    beforeKea?: (input: Input) => void
    beforeBuild?: (logic: Logic, input: Inputs) => void
    beforeLogic?: (logic: Logic, input: Input) => void
    afterLogic?: (logic: Logic, input: Input) => void
    afterBuild?: (logic: Logic, input: Inputs) => void
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
}

interface Context {
  plugins: {
    activated: Plugin[]
    buildOrder: []
    buildSteps: Record<string, BuildStep[]>
    events: {}
    logicFields: {}
    contexts: Record<string, object>
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
    mounted: {}
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
