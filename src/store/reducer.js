import { getContext } from '../context'
import { runPlugins } from '../plugins'

export const ATTACH_REDUCER = '@KEA/ATTACH_REDUCER'
export const DETACH_REDUCER = '@KEA/DETACH_REDUCER'

const defaultState = {}

function initRootReducerTree (pathStart) {
  const { reducers: { tree } } = getContext()
  if (!tree[pathStart]) {
    tree[pathStart] = {}
    regenerateRootReducer(pathStart)
  }
}

export function keaReducer (pathStart = 'scenes') {
  const { reducers: { roots } } = getContext()
  initRootReducerTree(pathStart)

  return (state = defaultState, action, fullState) => {
    return roots[pathStart] ? roots[pathStart](state, action, fullState) : state
  }
}

export function attachReducer (logic) {
  const { path, reducer } = logic
  const { 
    reducers: { tree, combined }, 
    options: { attachStrategy }, 
    store 
  } = getContext()
  
  const pathStart = path[0]

  initRootReducerTree(pathStart)

  let pointer = tree

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
          console.error(`[KEA] Can not add reducer to "${path.join('.')}". There is something in the way:`, pointer[pathPart])
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

  if (attachStrategy === 'dispatch' || attachStrategy === 'replace') {
    runPlugins('beforeAttach', logic)

    if (attachStrategy === 'dispatch') {
      store && store.dispatch({ type: ATTACH_REDUCER, payload: { path, reducer } })
    } else if (attachStrategy === 'replace') {
      store && store.replaceReducer(combined)
    }

    runPlugins('afterAttach', logic)
  }
}

export function detachReducer (logic) {
  const { path } = logic

  const { 
    reducers: { tree, combined }, 
    options: { detachStrategy }, 
    store 
  } = getContext()
  
  const pathStart = path[0]

  if (detachStrategy === 'persist') {
    return
  }

  initRootReducerTree(pathStart)

  let pointer = tree

  let detached = false

  // ['scenes', 'sceneName', 'page', 'key']
  for (let i = path.length - 2; i >= 0; i--) {
    let pointerToHere = pointer
    for (let j = 0; j <= i; j++) {
      pointerToHere = (pointerToHere && pointerToHere[path[j]]) || undefined
    }

    if (pointerToHere) {
      if (Object.keys(pointerToHere).length === 0) {
        // next
      } else if (Object.keys(pointerToHere).length >= 1 && i === path.length - 2 && typeof pointerToHere[path[i + 1]] === 'function') {
        delete pointerToHere[path[i + 1]]
        detached = true
      } else if (detached && Object.keys(pointerToHere).length >= 1 && i < path.length - 2 && Object.keys(pointerToHere[path[i + 1]]).length === 0) {
        delete pointerToHere[path[i + 1]]
      } else {
        break
      }
    }
  }

  regenerateRootReducer(pathStart)

  if (detached) {
    if (detachStrategy === 'dispatch' || detachStrategy === 'replace') {
      runPlugins('beforeDetach', logic)
  
      if (detachStrategy === 'dispatch') {
        store && store.dispatch({ type: DETACH_REDUCER, payload: { path } })
      } else if (detachStrategy === 'replace') {
        store && store.replaceReducer(combined)
      }

      runPlugins('afterDetach', logic)
    }
  }
}

export function regenerateRootReducer (pathStart) {
  const { reducers: { tree, roots } } = getContext()
  roots[pathStart] = recursiveCreateReducer(tree[pathStart])
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

  if (Object.keys(children).length > 0) {
    return combineKeaReducers(children)
  } else {
    const emptyObj = {}
    return () => emptyObj
  }
}

// We are using our own function for the tree nodes instead of redux's combineReducers beacause this way we will not
// get the constant 'Unexpected key "1" found in previous state received by the reducer' warnings when unmounting.
// Instead we'll simply discard the keys we don't need.
// Please note that logic store reducers are still built with redux's combineReducers.
export function combineKeaReducers (reducers) {
  const reducerKeys = Object.keys(reducers)

  return function combination (state = {}, action, fullState) {
    let stateChanged = Object.keys(state).length !== reducerKeys.length
    let nextState = {}

    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i]
      const reducer = reducers[key]
      const previousKeyState = state[key]
      const nextKeyState = reducer(previousKeyState, action, fullState || state)
      if (typeof nextKeyState === 'undefined') {
        throw new Error(`[KEA] Reducer "${key}" returned undefined for action "${action && action.type}"`)
      }
      nextState[key] = nextKeyState
      stateChanged = stateChanged || nextKeyState !== previousKeyState
    }

    return stateChanged ? nextState : state
  }
}
