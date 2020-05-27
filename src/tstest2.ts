const obj = {}

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

function kea() {
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
