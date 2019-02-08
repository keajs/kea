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

// input: objects = array of objects with values: { value, type, reducer, ...options }
//        actions = { 'some redux action': true }
// output: combined reducer function (state, action) {}
export function combineReducerObjects (path, objects, actions) {
  const reducers = {}

  Object.keys(objects).forEach(key => {
    reducers[key] = objects[key].reducer
  })

  if (Object.keys(reducers).length > 0) {
    let defaults = {}
    for (let key of Object.keys(objects)) {
      defaults[key] = objects[key].value
    }

    const reducer = combineReducers(reducers)
    return (state = defaults, action) => {
      if (state === defaults || actions[action.type] || Object.keys(state).length === 0) {
        return reducer(state, action)
      } else {
        return state
      }
    }
  } else {
    return () => emptyObj
  }
}

export function getReducerActions (reducerArrays) {
  const allActions = {}

  for (let reducerKey of Object.keys(reducerArrays)) {
    const s = reducerArrays[reducerKey]
    if (Array.isArray(s)) {
      const reducer = s[s.length - 1]

      if (typeof reducer !== 'function') {
        for (let key of Object.keys(reducer)) {
          allActions[key] = true
        }
      }
    }
  }

  return allActions
}

// input: object with values: [value, (type), (options), reducer]
// output: object with values: { value, type, reducer, ...options }
export function convertReducerArrays (reducerArrays) {
  if (!reducerArrays) {
    return reducerArrays
  }

  const reducers = {}

  for (let reducerKey of Object.keys(reducerArrays)) {
    const s = reducerArrays[reducerKey]
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

      reducers[reducerKey] = warnIfUndefinedActionCreator(reducerObject, reducerKey)
    } else {
      reducers[reducerKey] = s
    }
  }

  return reducers
}
