import { kea } from './kea'

const logic = kea({
  actions: () => ({
    doSomething: true,
    doSomethingElse: (id: number, bla?: string) => ({ id, bla }),
  }),

  reducers: () => ({
    otherReducer: [
      (null as unknown) as { key: 'value' },
      {
        doSomething: () => 1234,
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
