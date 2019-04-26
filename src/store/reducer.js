import { combineReducers } from 'redux'

import { getCache, getReduxStore } from '../cache'

export const ATTACH_REDUCER = '@KEA/ATTACH_REDUCER'
export const DETACH_REDUCER = '@KEA/DETACH_REDUCER'

const defaultState = {}

function initRootReducerTree (pathStart) {
  const { reducerTree } = getCache()
  if (!reducerTree[pathStart]) {
    reducerTree[pathStart] = {}
    regenerateRootReducer(pathStart)
  }
}

export function keaReducer (pathStart = 'scenes', options = {}) {
  const { rootReducers } = getCache()
  initRootReducerTree(pathStart)

  if (options && options.default) {
    getCache().defaultReducerRoot = pathStart
  }

  return (state = defaultState, action) => {
    return rootReducers[pathStart] ? rootReducers[pathStart](state, action) : state
  }
}

export function firstReducerRoot () {
  const { defaultReducerRoot, reducerTree } = getCache()
  return defaultReducerRoot || Object.keys(reducerTree)[0]
}

export function attachReducer (path, reducer) {
  const { reducerTree } = getCache()
  const pathStart = path[0]

  initRootReducerTree(pathStart)

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

  const store = getReduxStore()
  store && store.dispatch({ type: ATTACH_REDUCER, payload: { path, reducer } })
}

export function detachReducer (path, reducer) {
  const { reducerTree } = getCache()
  const pathStart = path[0]

  initRootReducerTree(pathStart)

  let pointer = reducerTree

  // ['scenes', 'sceneName', 'page', 'key']
  for (let i = path.length - 1; i >= 0; i--) {
    let pointerToHere = pointer
    for (let j = 0; j <= i; j++) {
      pointerToHere = (pointerToHere && pointerToHere[path[j]]) || undefined
    }

    if (pointerToHere) {
      if (Object.keys(pointerToHere).length === 0) {
        // next
      } else if (Object.keys(pointerToHere).length === 1 && i < path.length - 1 && typeof pointerToHere[path[i + 1]] !== 'undefined') {
        // delete pointerToHere[path[i + 1]]
        pointerToHere[path[i + 1]] = undefined
      } else {
        return
      }
    }
  }

  regenerateRootReducer(pathStart)

  const store = getReduxStore()
  store && store.dispatch({ type: DETACH_REDUCER, payload: { path, reducer } })
}

export function regenerateRootReducer (pathStart) {
  const { reducerTree, rootReducers } = getCache()
  const rootReducer = recursiveCreateReducer(reducerTree[pathStart])

  rootReducers[pathStart] = rootReducer
}

export function recursiveCreateReducer (treeNode) {
  if (typeof treeNode === 'function') {
    return treeNode
  }

  let children = {}
  Object.keys(treeNode).forEach(key => {
    if (typeof treeNode[key] !== 'undefined') {
      children[key] = recursiveCreateReducer(treeNode[key])
    }
  })

  // we have reducers, return combineReducers
  if (Object.keys(children).length > 0) {
    return combineReducers(children)

  // we have reducers that were removed, return something that just returns an empty object
  } else if (Object.keys(treeNode).length > 0) {
    const emptyObj = {}
    return () => emptyObj

  // no reducers and nothing was ever removed... return something that returns with the preloaded state
  } else {
    return (state, action) => state
  }
}
