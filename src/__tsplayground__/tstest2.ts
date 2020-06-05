import { Object } from 'ts-toolbelt'

type InputGenerator = (logic: Logic) => Record<string, any>

type Logic = {
  isLogic: boolean
  actions: Record<string, any>
}

// TRY 1: toolbelt and action
// type LogicWithActions<L extends Logic, ActionsInput> = Object.Update<L, 'actions', AddActionsToLogic<L, ActionsInput>>
//
// type AddActionsToLogic<L extends Logic, ActionsInput extends Record<string, any>> = {
//   [K in keyof ActionsInput]: () => { type: string; payload: ActionsInput[K] }
// } & {
//   hoopla: () => void
// } & L['actions'] & {
//     <LL extends L, I extends InputGenerator>(input: I): LogicWithActions<LL, ReturnType<I>>
//   }

// TRY 2: inline with toolbelt
// type LogicWithActions<L extends Logic, ActionsInput> = Object.Update<
//   L,
//   'actions',
//   {
//     [K in keyof ActionsInput]: () => { type: string; payload: ActionsInput[K] }
//   } & {
//     hoopla: () => void
//   } & L['actions'] & {
//       <LL extends L, I extends InputGenerator>(input: I): LogicWithActions<LL, ReturnType<I>>
//     }
// >

// TRY 3: no toolbelt and inline
type LogicWithActions<
  L extends Logic,
  ActionsInput,
  LL extends Logic = {
    [K in keyof Logic]: Logic[K]
  } & {
    actions: Logic['actions'] &
      {
        [K in keyof ActionsInput]: () => { type: string; payload: ActionsInput[K] }
      }
  }
> = Builder<LL>

interface Builder<L extends Logic = Logic> {
  actions<LL extends L, I extends InputGenerator>(this: Builder<L>, input: I): LogicWithActions<LL, ReturnType<I>>
}

//
// declare interface LogicBlanket<T> {
//   value(): T;  // This methods is available for any T.
//
//   // This method is only available for array types, where T matches V[].
//   map<U, V>(this: Chainable<V[]>, mapFn: (v: V) => U): Chainable<U[]>;
// }

const functions = {
  actions(logic, input) {
    Object.entries(input).forEach(([key, actionGenerator]) => {
      if (typeof actionGenerator === 'function') {
        logic.actions[key] = (...args) => ({ type: key, payload: actionGenerator(...args) })
      } else {
        logic.actions[key] = () => ({ type: key, payload: { value: actionGenerator } })
      }
    })
  },
  reducers(logic, input) {
    Object.entries(input).forEach(([key, [reducerDefault, reducerHash]]) => {
      logic.reducers[key] = (state, action) => reducerDefault
    })
  },
}
const keys = ['actions', 'reducers']

function kea<L extends Logic = Logic>(): Builder<L> {
  const wrapper = {}
  const inputs = []
  let builtLogic
  // let isMounted = false

  wrapper.build = function () {
    if (builtLogic) {
      return builtLogic
    }
    builtLogic = {
      actions: {},
      reducers: {},
      reducer: undefined,
    }
    inputs.forEach(({ key, builder }) => {
      builder(logic)
    })
    return builtLogic
  }

  keys.forEach((key) => {
    Object.defineProperty(wrapper, key, {
      get: function () {
        if (builtLogic) {
          return builtLogic[key]
        } else {
          return (inputGenerator) => {
            inputs.push({
              key: key,
              builder: (logic) => functions[key](logic, inputGenerator(logic)),
            })
            return wrapper
          }
        }
      },
    })
  })

  return wrapper
}

const logic1 = kea().actions(() => ({
  submit: true,
}))
logic1.actions.submit()

const logic2 = logic1.actions(({ actions }) => ({
  submit2: true,
}))

const logic3 = logic1.actions(({ actions }) => ({
  submit3: true,
}))
// logic1.actions.su

// const logic3 = kea()
//   .actions((logic) => ({
//     submit: true,
//   }))
//   .actions((logic) => ({
//     reset: (id) => ({ id }),
//   }))
//   .actions(logic => ({
//     bla: (id) => ({ id }),
//   }))

logic3.actions

const logic = kea()
  .actions(() => ({
    submit: true,
  }))
  .actions(() => ({
    reset: (id) => ({ id }),
  }))
  .reducers(() => ({
    isSubmitting: [
      false,
      {
        submit: () => true,
      },
    ],
  }))
