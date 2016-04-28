import { call, take, cancel, fork } from 'redux-saga/effects'
import { combineReducers } from 'redux'

export const NEW_SCENE = '@@kea/NEW_SCENE'

// worker functions are loaded globally, reducers locally in store
let loadedWorkers = {}

export function createRootSaga (appSagas = null) {
  return function * () {
    let runningSaga = null
    let ranAppSagas = false

    while (true) {
      const { payload } = yield take(NEW_SCENE)

      if (!ranAppSagas && appSagas) {
        yield call(appSagas)
        ranAppSagas = true
      }

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
  const rootReducer = createCombinedKeaReducer({}, appReducers)

  const store = finalCreateStore(rootReducer)

  store.loadedReducers = {}
  store.currentScene = null

  store.addKeaScene = function (scene) {
    const { name } = scene

    if (this.currentScene === name) {
      return
    }

    this.loadedReducers[name] = scene.reducer
    loadedWorkers[name] = scene.worker

    this.replaceReducer(createCombinedKeaReducer(this.loadedReducers, appReducers))

    this.dispatch({
      type: NEW_SCENE,
      payload: {
        name
      }
    })

    this.currentScene = name
  }

  return store
}
