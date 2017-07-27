import { combineReducers } from 'redux'

// storageAvailable('localStorage') == true or false
function storageAvailable (type) {
  try {
    var storage = window[type]
    var x = '__storage_test__'
    storage.setItem(x, x)
    storage.removeItem(x)
    return true
  } catch (e) {
    return false
  }
}

let storageCache = {}

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

// create reducer function from such an object { [action]: (state, payload) => state }
// with the added benefit that it's stored in localStorage
export function createPersistentReducer (actions, defaultValue, key) {
  if (storageAvailable('localStorage')) {
    let storage = window.localStorage

    const value = storage[key] ? JSON.parse(storage[key]) : defaultValue
    storageCache[key] = value

    const reducer = createReducer(actions, value)

    return (state, payload) => {
      const result = reducer(state, payload)
      if (storageCache[key] !== result) {
        storageCache[key] = result
        storage[key] = JSON.stringify(result)
      }
      return result
    }
  } else {
    return createReducer(actions, defaultValue)
  }
}

// input: object with values: { value, type, reducer, ...options } or function(state, action) {}
// output: combined reducer function (state, action) {}
export function combineReducerObjects (path, objects) {
  const reducers = {}

  Object.keys(objects).forEach(key => {
    const object = objects[key]
    if (typeof object.reducer === 'function') {
      reducers[key] = object.reducer
    } else {
      reducers[key] = path && object.persist
        ? createPersistentReducer(object.reducer, object.value, path.join('.') + key)
        : createReducer(object.reducer, object.value)
    }
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
        reducer: s[3] || s[2]
      }, s[3] ? s[2] : {}), keys[i])
    }
  }

  return reducers
}
