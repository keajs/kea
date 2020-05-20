export interface Input {
  extend?: Input[]
  key?: ((props: object) => string)
  path?: (key: string | undefined) => string[]
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
