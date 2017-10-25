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
    return () => ({})
  }
}

// input: object with values: [value, type, options, reducer]
// output: object with values: { value, type, reducer, ...options }
export function convertReducerArrays (reducers) {
  if (!reducers) {
    return reducers
  }

  const keys = Object.keys(reducers)
  for (let i = 0; i < keys.length; i++) {
    const s = reducers[keys[i]]
    if (Array.isArray(s)) {
      // s = [ value, type, options, reducer ]
      reducers[keys[i]] = warnIfUndefinedActionCreator(Object.assign({
        value: s[0],
        type: s[1], // proptype
        reducer: createReducer(s[3] || s[2], s[0])
      }, s[3] ? { options: s[2] } : {}), keys[i])
    }
  }

  return reducers
}
