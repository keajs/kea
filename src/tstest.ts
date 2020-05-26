// @ts-ignore
// import { a as aa } from './tstest_type.ts'

// import { kea } from './kea'
//
// const logic = kea({
//   actions: () => ({
//     doSomething: true,
//     doSomethingElse: (id: number, bla?: string) => ({ id, bla }),
//   }),
//
//   reducers: () => ({
//     otherReducer: [
//       (null as unknown) as { key: 'value' },
//       {
//         doSomething: () => 1234,
//       },
//     ],
//     anotherReducer: [
//       'bla',
//       {
//         doSomething: () => 'awerwe',
//       },
//     ],
//   }),
// })
//
// logic.build().constants
// logic.build().actions.doSomething()
// logic.build().actions.doSomethingElse(123, 'aert')
// logic.build().reducers.otherReducer
// logic.build().selectors.otherReducer
// logic.build().reducers.anotherReducer
// logic.build().values.anotherReducer

type GoesInActionsType = Record<string, string>

type Reducers<Actions> = {
  [K in keyof Actions]: () => Actions[K]
}

interface GoesIn<K extends GoesInActionsType> {
  actions: K
  reducers: Record<string, Reducers<K>>
}

const makeThing = <T extends GoesIn<T['actions']>>(x: T): T => {
  return x;
};
const a = makeThing({
  actions: {
    firstAction: 'first',
    secondAction: 'second',
    thirdAction: 'third',
  },
  reducers: {
    bla: {
      firstAction: () => 'first',
      secondAction: () => 'second',
    },
  },
});


//
// type JSONValue = string | number | boolean | JSONObject | JSONArray;
//
// interface JSONObject {
//   [x: string]: JSONValue;
// }
//
// interface JSONArray extends Array<JSONValue> { }
//

type ValueOrArray<T> = T | Array<ValueOrArray<T>>

const a0: ValueOrArray<number> = 1
const a1: ValueOrArray<number> = [1, [2, 3], [4, [5, [6, 7]]]]

/// merge test
interface Input {
  actions?: Record<string, string>
  reducers?: Record<string, string>
}
//
// interface AddStuff<I extends Input> {
//
// }

// type GetActions<T extends Record<string, Record<string, () => string>> = {

// {
//   [K in keyof AddStuff<I>['something']['actions']]: () => AddStuff<I>['something']['actions'][K]
// }
// }
//
// interface Logic<I extends Input> {
//   actions: {
//     [K in keyof I['actions']]: () => I['actions'][K]
//   } & GetActions<AddStuff<I>>
//   reducers: {
//     [K in keyof I['reducers']]: () => I['reducers'][K]
//   }
// }
//
// interface AddStuff<I extends Input> {
//   something: {
//     actions: {
//       blue: () => 'yes'
//     }
//   }
// }
//
//
// function transform<T extends Input>(input: T): Logic<T> {
//   return {
//     actions: {},
//     reducers: {},
//   }
// }
//
// const bla = transform({
//   actions: {
//     firstAction: 'first',
//     secondAction: 'second',
//   },
// })
//
// bla.actions.
