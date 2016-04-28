import { call, take, cancel, fork } from 'redux-saga/effects'
import { combineReducers } from 'redux'

export const NEW_SCENE = '@@kea/NEW_SCENE'

let loadedReducers = {}
let loadedWorkers = {}
let currentScene = null

export function createRootSaga (appSagas = null) {
  return function * () {
    let runningSaga = null

    if (appSagas) {
      yield call(appSagas)
    }

    while (true) {
      const { payload } = yield take(NEW_SCENE)

      if (runningSaga) {
        yield cancel(runningSaga)
      }

      if (loadedWorkers[payload.name]) {
        runningSaga = yield fork(loadedWorkers[payload.name])
      }
    }
  }
}

function createCombinedKeaReducer (sceneReducers, appReducers) {
  const hasScenes = sceneReducers && Object.keys(sceneReducers).length > 0

  return combineReducers(Object.assign({}, appReducers, {
    scenes: hasScenes ? combineReducers(sceneReducers) : () => ({})
  }))
}

export function createKeaStore (finalCreateStore, appReducers = {}) {
  const rootReducer = createCombinedKeaReducer(loadedReducers, appReducers)

  const store = finalCreateStore(rootReducer)

  store.clearKeaScene = function () {
    loadedReducers = {}
    loadedWorkers = {}
    currentScene = null
  }

  store.addKeaScene = function (scene) {
    const { name } = scene

    if (currentScene === name) {
      return
    }

    loadedReducers[name] = scene.reducer
    loadedWorkers[name] = scene.worker
    this.replaceReducer(createCombinedKeaReducer(loadedReducers, appReducers))

    this.dispatch({
      type: NEW_SCENE,
      payload: {
        name
      }
    })

    currentScene = name
  }

  return store
}
