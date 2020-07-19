import { kea } from './kea'

export interface logicType {
  key: any
  actionCreators: {
    doSomething: () => {
      type: 'do something (samples.logic2)'
      payload: {
        value: boolean
      }
    }
    doSomethingElse: (
      id: number,
      bla?: string,
    ) => {
      type: 'do something else (samples.logic2)'
      payload: { id: number; bla: string }
    }
  }
  actionKeys: any
  actions: {
    doSomething: () => {
      type: 'do something (samples.logic2)'
      payload: {
        value: boolean
      }
    }
    doSomethingElse: (
      id: number,
      bla?: string,
    ) => {
      type: 'do something else (samples.logic2)'
      payload: { id: number; bla: string }
    }
  }
  cache: Record<string, any>
  connections: any
  constants: any
  defaults: any
  events: any
  path: ['samples', 'logic2']
  pathString: 'samples.logic2'
  propTypes: any
  props: Record<string, any>
  reducer: (
    state: any,
    action: () => any,
    fullState: any,
  ) => {
    otherReducer: {
      key: string
    }
    anotherReducer: string
  }
  reducerOptions: any
  reducers: {
    otherReducer: (
      state: {
        key: string
      },
      action: any,
      fullState: any,
    ) => {
      key: string
    }
    anotherReducer: (state: string, action: any, fullState: any) => string
  }
  selector: (
    state: any,
  ) => {
    otherReducer: {
      key: string
    }
    anotherReducer: string
  }
  selectors: {
    otherReducer: (
      state: any,
      props: any,
    ) => {
      key: string
    }
    anotherReducer: (state: any, props: any) => string
  }
  values: {
    otherReducer: {
      key: string
    }
    anotherReducer: string
  }
  _isKea: true
}

const logic = kea<logicType>({
  actions: () => ({
    doSomething: true,
    doSomethingElse: (id: number, bla?: string) => ({ id, bla }),
  }),

  reducers: () => ({
    otherReducer: [
      null as { key: string },
      {
        doSomething: () => ({ key: 'value2' }),
      },
    ],
    anotherReducer: [
      'bla',
      {
        doSomething: () => 'awerwe',
      },
    ],
  }),
})

logic.build().constants
logic.build().actions.doSomething()
logic.build().actions.doSomethingElse(123, 'aert')
logic.build().reducers.otherReducer
logic.build().selectors.otherReducer
logic.build().reducers.anotherReducer
logic.build().values.anotherReducer
