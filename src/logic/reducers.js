import { combineReducers } from 'redux'

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

export function createReducers (input, output) {
  if (!input.reducers) {
    return
  }

  const reducerCreators = input.reducers(output)

  const reducerObjects = convertReducerArrays(reducerCreators)

  Object.keys(reducerObjects).forEach(key => {
    const reducerObject = reducerObjects[key]

    output.propTypes[key] = reducerObject.type
    output.defaults[key] = reducerObject.value
    output.reducers[key] = reducerObject.reducer
    // TODO: store this somehow
    // output.meta[key] = reducerObject.options
  })

  output.reducer = combineReducers(output.reducers)
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

      let reducerObject = {
        value: value,
        type: type,
        reducer: typeof reducer === 'function' ? reducer : createReducer(reducer, value)
      }

      if (options) {
        reducerObject.options = options
      }

      reducers[keys[i]] = warnIfUndefinedActionCreator(reducerObject, keys[i])
    }
  }

  return reducers
}
