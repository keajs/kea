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

const emptyObj = {}

// input: object with values: { value, type, reducer, ...options } or function(state, action) {}
// output: combined reducer function (state, action) {}
export function combineReducerObjects (path, objects) {
  const reducers = {}

  Object.keys(objects).forEach(key => {
    reducers[key] = objects[key].reducer
  })

  if (Object.keys(reducers).length > 0) {
    return combineReducers(reducers)
  } else {
    return () => emptyObj
  }
}

// input: object with values: [value, (type), (options), reducer]
// output: object with values: { value, type, reducer, ...options }
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
