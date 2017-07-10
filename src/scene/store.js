import { call, take, cancel, fork } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import { combineReducers } from 'redux'

export const NEW_SCENE = '@@kea/NEW_SCENE'

// worker functions are loaded globally, reducers locally in store
let loadedWorkers = {}
let loadedScenes = {} // all loaded scenes
let currentScene = null

// all reducers that are created
let reducerTree = {}
let rootReducers = {}

export function clearStore () {
  loadedWorkers = {}
  loadedScenes = {}
  currentScene = null
  reducerTree = {}
  rootReducers = {}
}

export function createRootSaga (appSagas = null) {
  return function * () {
    let runningSaga = null
    let ranAppSagas = false

    yield fork(componentSagaWatcher)

    while (true) {
      const { payload } = yield take(NEW_SCENE)
      const { name, background } = payload

      if (!ranAppSagas && appSagas) {
        yield call(appSagas)
        ranAppSagas = true
      }

      if (!background && runningSaga) {
        yield cancel(runningSaga)
      }

      if (loadedWorkers[name]) {
        if (background) {
          yield fork(loadedWorkers[name])
        } else {
          runningSaga = yield fork(loadedWorkers[name])
        }
      }
    }
  }
}

export const keaSaga = createRootSaga()

let emitter
let cancelCounter = 1
let toCancel = {}

function createComponentChannel (socket) {
  return eventChannel(emit => {
    emitter = emit
    return () => {}
  })
}

function * componentSagaWatcher () {
  const channel = yield call(createComponentChannel)

  while (true) {
    const { startSaga, cancelSaga, saga, counter } = yield take(channel)
    if (startSaga) {
      toCancel[counter] = yield fork(saga)
    }
    if (cancelSaga) {
      yield cancel(toCancel[counter])
    }
  }
}

export function startSaga (saga) {
  if (emitter) {
    cancelCounter += 1
    emitter({ startSaga: true, saga, counter: cancelCounter })
    return cancelCounter
  }

  return null
}

export function cancelSaga (counter) {
  if (emitter) {
    emitter({ cancelSaga: true, counter })
  }
}

export function keaReducer (pathStart = 'scenes') {
  if (!reducerTree[pathStart]) {
    reducerTree[pathStart] = {}
    regenerateRootReducer(pathStart)
  }

  return (state = {}, action) => {
    return rootReducers[pathStart] ? rootReducers[pathStart](state, action) : state
  }
}

export function keaMiddlware () {

}

export function firstReducerRoot () {
  return Object.keys(reducerTree)[0]
}

export function addReducer (path, reducer, regenerate = false) {
  const pathStart = path[0]

  if (typeof reducerTree[pathStart] === 'undefined') {
    console.error(`[KEA-LOGIC] Path starting with "${pathStart}" is not connected to the reducer tree!`, path)
    return
  }

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
  rootReducers[pathStart] = recursiveCreateReducer(reducerTree[pathStart])
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

// add reducers and sagas from the scene into the state
export function addKeaScene (scene, background = false, store = null) {
  if (!scene) {
    return
  }

  const { name } = scene

  if (currentScene === name) {
    return
  }

  if (!loadedScenes[name]) {
    // store the scene and saga
    loadedWorkers[name] = scene.worker
    loadedScenes[name] = scene

    let rootReducersToRegenerate = {}

    // go through all loaded scenes and recreate the reducers
    // this is so because scenes can load logic from other scenes
    Object.keys(loadedScenes).forEach(key => {
      let { logic } = loadedScenes[key]

      logic.forEach(logicClass => {
        const { path, reducer } = logicClass

        if (!path || !Array.isArray(path)) {
          console.error(`[KEA-LOGIC] No path for logic in scene ${name}!`, logicClass)
          return
        }

        if (!reducer) {
          console.error('[KEA-LOGIC] No reducer in logic!', path, logicClass)
          console.trace()
          return
        }

        addReducer(path, reducer, false)

        rootReducersToRegenerate[path[0]] = true
      })
    })

    Object.keys(rootReducersToRegenerate).forEach(pathStart => {
      regenerateRootReducer(pathStart)
    })
  }

  if (store) {
    store.dispatch({
      type: NEW_SCENE,
      payload: {
        name,
        background
      }
    })
  }

  currentScene = name
}
