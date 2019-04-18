import { combineReducers } from 'redux'

export const ATTACH_REDUCER = '@KEA/ATTACH_REDUCER'

// worker functions are loaded globally, reducers locally in store
let defaultReducerRoot = null

// all reducers that are created
let reducerTree = {}
let rootReducers = {}
let syncedWithStore = {} // TODO: remove?
let store

const defaultState = {}

export function attachStore (storeReference) {
  store = storeReference
}

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

export function addReducer (path, reducer) {
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
        // if we're in the root level in the tree and it's an empty object
        if (i === 0 && typeof pointer[pathPart] === 'object' && Object.keys(pointer[pathPart]).length === 0) {
          // don't block here

        // if it's a function, assume it's a reducer and replacing it is fine
        // otherwise give an error
        } else if (typeof pointer[pathPart] !== 'function') {
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

  regenerateRootReducer(pathStart)
  store && store.dispatch({ type: ATTACH_REDUCER, payload: { path, reducer } })
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
  if (typeof treeNode === 'function') {
    return treeNode
  }

  let children = {}

  Object.keys(treeNode).forEach(key => {
    children[key] = recursiveCreateReducer(treeNode[key])
  })

  return Object.keys(children).length > 0 ? combineReducers(children) : (state, action) => state
}
