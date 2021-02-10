import { getContext } from '../context'
import { runPlugins } from '../plugins'
import { BuiltLogic, ReducerFunction } from '../types'
import { Reducer } from 'redux'

export const ATTACH_REDUCER = '@KEA/ATTACH_REDUCER'
export const DETACH_REDUCER = '@KEA/DETACH_REDUCER'

const defaultState = {}

export function initRootReducerTree(pathStart: string): void {
  const {
    reducers: { tree, whitelist },
  } = getContext()
  if (!tree[pathStart]) {
    if (whitelist && !whitelist[pathStart]) {
      throw new Error(`[KEA] Can not start reducer's path with "${pathStart}"! Please add it to the whitelist`)
    }
    tree[pathStart] = {}
    regenerateRootReducer(pathStart)
  }
}

export function keaReducer(pathStart = 'scenes'): ReducerFunction {
  const {
    reducers: { roots },
  } = getContext()
  initRootReducerTree(pathStart)

  return (state = defaultState, action, fullState) => {
    return roots[pathStart] ? roots[pathStart](state, action, fullState) : state
  }
}

export function attachReducer(logic: BuiltLogic): void {
  const { path, reducer } = logic
  const {
    reducers: { tree },
    options: { attachStrategy },
    store,
  } = getContext()

  const pathStart = path[0].toString()

  initRootReducerTree(pathStart)

  let pointer = tree

  for (let i = 0; i < path.length; i++) {
    const pathPart = path[i].toString()

    // last part of the ̦path, so [..., pathPart] = path
    if (i === path.length - 1) {
      // there's already something here!
      if (pointer[pathPart]) {
        // if we're in the root level in the tree and it's an empty object
        if (i === 0 && typeof pointer[pathPart] === 'object' && Object.keys(pointer[pathPart]).length === 0) {
          // don't block here
          // if it's a function, assume it's a reducer and replacing it is fine
          // otherwise give an error
        } else if (typeof pointer[pathPart] !== 'function') {
          console.error(
            `[KEA] Can not add reducer to "${path.join('.')}". There is something in the way:`,
            pointer[pathPart],
          )
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
      store && store.replaceReducer(createReduxStoreReducer())
    }

    runPlugins('afterAttach', logic)
  }
}

export function detachReducer(logic: BuiltLogic): void {
  const { path } = logic

  const {
    reducers: { tree },
    options: { detachStrategy },
    store,
  } = getContext()

  const pathStart = path[0].toString()

  if (detachStrategy === 'persist') {
    return
  }

  let detached = false

  // ['scenes', 'sceneName', 'page', 'key']
  for (let i = path.length - 2; i >= 0; i--) {
    let pointerToHere = tree
    for (let j = 0; j <= i; j++) {
      pointerToHere = (pointerToHere && pointerToHere[path[j].toString()]) || undefined
    }

    if (pointerToHere) {
      if (Object.keys(pointerToHere).length === 0) {
        // next
      } else if (
        Object.keys(pointerToHere).length >= 1 &&
        i === path.length - 2 &&
        typeof pointerToHere[path[i + 1].toString()] === 'function'
      ) {
        delete pointerToHere[path[i + 1].toString()]
        detached = true
      } else if (
        detached &&
        Object.keys(pointerToHere).length >= 1 &&
        i < path.length - 2 &&
        Object.keys(pointerToHere[path[i + 1].toString()]).length === 0
      ) {
        delete pointerToHere[path[i + 1].toString()]
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
        store && store.replaceReducer(createReduxStoreReducer())
      }

      runPlugins('afterDetach', logic)
    }
  }
}

export function regenerateRootReducer(pathStart: string): void {
  const {
    reducers: { tree, roots, whitelist },
  } = getContext()

  if (
    pathStart !== 'kea' &&
    !whitelist &&
    typeof tree[pathStart] === 'object' &&
    Object.keys(tree[pathStart]).length === 0
  ) {
    delete roots[pathStart]
  } else {
    roots[pathStart] = recursiveCreateReducer(tree[pathStart])
  }
  regenerateCombinedReducer()
}

export function recursiveCreateReducer(treeNode: ReducerFunction | Record<string, any>): ReducerFunction {
  if (typeof treeNode === 'function') {
    return treeNode as ReducerFunction
  }

  const children: Record<string, any> = {}

  Object.keys(treeNode).forEach((key) => {
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
// Please note that logic reducers are still built with redux's combineReducers.
export function combineKeaReducers(reducers: Record<string, ReducerFunction>): ReducerFunction {
  const reducerKeys = Object.keys(reducers)

  return function combination(state = {}, action, fullState) {
    let stateChanged = Object.keys(state).length !== reducerKeys.length
    const nextState: Record<string, any> = {}

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

function regenerateCombinedReducer() {
  const { redux, roots } = getContext().reducers
  const reducers = Object.assign({}, redux, roots)
  getContext().reducers.combined = combineKeaReducers(reducers)
}

export function createReduxStoreReducer(): Reducer {
  regenerateCombinedReducer()
  return (state = defaultState, action) => (getContext().reducers.combined as ReducerFunction)(state, action, state)
}
