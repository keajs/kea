import { combineReducers } from 'redux'

// worker functions are loaded globally, reducers locally in store
let defaultReducerRoot = null

// all reducers that are created
let reducerTree = {}
let rootReducers = {}
let syncedWithStore = {}

const defaultState = {}

export function clearReducerCache () {
  defaultReducerRoot = null
  reducerTree = {}
  rootReducers = {}
  syncedWithStore = {}
}

function initRootReducerTree (pathStart) {
  if (!reducerTree[pathStart]) {
    reducerTree[pathStart] = {}
    regenerateRootReducer(pathStart)
  }
}

export function keaReducer (pathStart = 'scenes', options = {}) {
  initRootReducerTree(pathStart)

  if (options && options.default) {
    defaultReducerRoot = pathStart
  }

  return (state = defaultState, action) => {
    return rootReducers[pathStart] ? rootReducers[pathStart](state, action) : state
  }
}

export function firstReducerRoot () {
  return defaultReducerRoot || Object.keys(reducerTree)[0]
}

export function addReducer (path, reducer, regenerate = false) {
  const pathStart = path[0]

  initRootReducerTree(pathStart)

  syncedWithStore[pathStart] = false

  let pointer = reducerTree

  for (let i = 0; i < path.length; i++) {
    const pathPart = path[i]

    // last part of the path, so [..., pathPart] = path
    if (i === path.length - 1) {
      // there's already something here!
      if (pointer[pathPart]) {
        // if it's a function, assume it's a reducer and replacing it is fine
        // otherwise give an error
        if (typeof pointer[pathPart] !== 'function') {
          console.error(`[KEA-LOGIC] Can not add reducer to "${path.join('.')}". There is something in the way:`, pointer[pathPart])
          return
        }
      }

      pointer[pathPart] = reducer
    } else {
      if (!pointer[pathPart]) {
        pointer[pathPart] = {}
      }
      pointer = pointer[pathPart]
    }
  }

  if (regenerate) {
    regenerateRootReducer(pathStart)
  }
}

export function regenerateRootReducer (pathStart) {
  const rootReducer = recursiveCreateReducer(reducerTree[pathStart])

  rootReducers[pathStart] = (state, action) => {
    syncedWithStore[pathStart] = true
    return rootReducer(state, action)
  }
}

export function isSyncedWithStore (pathStart = null) {
  if (pathStart) {
    return syncedWithStore[pathStart]
  } else {
    return Object.values(syncedWithStore).filter(k => !k).length === 0
  }
}

export function recursiveCreateReducer (treeNode) {
  let children = {}
  Object.keys(treeNode).forEach(key => {
    if (typeof treeNode[key] === 'function') {
      children[key] = treeNode[key]
    } else {
      children[key] = recursiveCreateReducer(treeNode[key])
    }
  })

  return Object.keys(children).length > 0 ? combineReducers(children) : (state, action) => state
}
