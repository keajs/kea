import { Object } from 'ts-toolbelt'

type InputGenerator = (logic: Logic) => Record<string, any>

type Logic = {
  isLogic: boolean
  actions: Record<string, any>
}

type LogicWithActions<L extends Logic, ActionsInput> = Object.Update<L, 'actions', AddActionsToLogic<L, ActionsInput>>

type AddActionsToLogic<L extends Logic, ActionsInput extends Record<string, any>> = {
  [K in keyof ActionsInput]: () => ActionsInput[K]
} & {
  hoopla: () => void
} &
  L['actions'] & {
    <I extends InputGenerator>(input: I): LogicWithActions<L, ReturnType<I>>
  }

interface Builder<L extends Logic = Logic> {
  actions<I extends InputGenerator>(input: I): LogicWithActions<L, ReturnType<I>>
}

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

function kea(): Builder {
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
logic1.actions.submit

const logic2 = kea()
  .actions(() => ({
    submit: true,
  }))
  .actions(() => ({
    reset: (id) => ({ id }),
  }))
  .actions(() => ({
    bla: (id) => ({ id }),
  }))

logic2.actions.
// logic2.actions.

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

// logic.actions.submit == 'something real!'
