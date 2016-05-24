import { combineReducers } from 'redux'
import { createReducer } from 'redux-act'

export function createCombinedReducer (logics = []) {
  let reducer = {}

  logics.forEach(logic => {
    if (!logic.path) {
      console.error('[KEA-LOGIC] No path found for reducer!', logic)
      console.trace()
      return
    }
    if (!logic.reducer) {
      console.error('[KEA-LOGIC] No reducer in logic!', logic.path, logic)
      console.trace()
      return
    }
    reducer[logic.path[logic.path.length - 1]] = logic.reducer
  })

  return combineReducers(reducer)
}

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

export function createStructureReducer (path, structure) {
  const reducers = {}

  Object.keys(structure).forEach(key => {
    const mapping = structure[key]
    if (typeof mapping.reducer === 'function') {
      reducers[key] = mapping.reducer
    } else {
      reducers[key] = mapping.persist
                        ? createPersistentReducer(mapping.reducer, mapping.value, path.join('.') + key)
                        : createReducer(mapping.reducer, mapping.value)
    }
  })

  return combineReducers(reducers)
}
