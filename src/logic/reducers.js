import { combineReducers } from 'redux'

const emptyObject = {}

function warnIfUndefinedActionCreator (object, property) {
  if (process.env.NODE_ENV !== 'production') {
    if (object.reducer.undefined !== undefined) {
      console.warn(`A reducer with the property "${property}" is waiting for an action where its key is not defined.`)
    }
  }

  return object
}

// create reducer function from such an object { [action]: (state, payload) => state }
export function createReducer (mapping, defaultValue) {
  return (state = defaultValue, action) => {
    if (mapping[action.type]) {
      return mapping[action.type](state, action.payload, action.meta)
    } else {
      return state
    }
  }
}

export function createReducerInputs (input, logic) {
  if (!input.reducers) {
    return
  }

  const reducerCreators = input.reducers(logic)

  logic.reducerInputs = convertReducerArrays(reducerCreators)
}

export function createReducers (input, logic) {
  if (!input.reducers || !logic.reducerInputs) {
    return
  }

  Object.keys(logic.reducerInputs).forEach(key => {
    const reducerInput = logic.reducerInputs[key]

    logic.propTypes[key] = reducerInput.type
    logic.defaults[key] = reducerInput.value
    logic.reducers[key] = reducerInput.reducer
  })

  if (Object.keys(logic.reducers).length > 0) {
    logic.reducer = combineReducers(logic.reducers)
  } else {
    logic.reducer = () => emptyObject
  }
}

export function convertReducerArrays (reducers) {
  if (!reducers) {
    return reducers
  }

  const keys = Object.keys(reducers)
  for (let i = 0; i < keys.length; i++) {
    const s = reducers[keys[i]]
    if (Array.isArray(s)) {
      // s = [ value, (type), (options), reducer ]
      const value = s[0]
      const reducer = s[s.length - 1]
      const type = typeof s[1] === 'function' ? s[1] : undefined
      const options = typeof s[s.length - 2] === 'object' ? s[s.length - 2] : undefined

      let reducerInput = {
        value: value,
        type: type,
        reducer: typeof reducer === 'function' ? reducer : createReducer(reducer, value)
      }

      if (options) {
        reducerInput.options = options
      }

      reducers[keys[i]] = warnIfUndefinedActionCreator(reducerInput, keys[i])
    }
  }

  return reducers
}
