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

function createCombinedKeaReducer (sceneReducers, appReducers) {
  const hasScenes = sceneReducers && Object.keys(sceneReducers).length > 0

  return combineReducers(Object.assign({}, appReducers, {
    scenes: hasScenes ? combineReducers(sceneReducers) : () => ({})
  }))
}

export function createKeaStore (finalCreateStore, appReducers = {}) {
  const rootReducer = createCombinedKeaReducer({}, appReducers)

  const store = finalCreateStore(rootReducer)

  store.loadedScenes = {} // all loaded scenes
  store.loadedReducers = {}
  store.currentScene = null

  // create a function that will load all new reducers
  store.addKeaScene = function (scene, background = false) {
    if (!scene) {
      return
    }

    const { name } = scene

    if (this.currentScene === name) {
      return
    }

    if (!this.loadedScenes[name]) {
      // store the scene and saga
      loadedWorkers[name] = scene.worker
      this.loadedScenes[name] = scene

      // go through all loaded scenes and recreate the reducers
      // this is so because scenes can load logic from other scenes
      Object.keys(this.loadedScenes).forEach(key => {
        let { logic } = this.loadedScenes[key]

        logic.forEach(logicClass => {
          const { path } = logicClass

          if (path.length !== 3 || path[0] !== 'scenes') {
            console.error(`[KEA-LOGIC] logic class in scene "${key}" does not follow the path structure ["scenes", "sceneName", "logicName"]:`, path)
            return
          }

          if (!logicClass.reducer) {
            console.error('[KEA-LOGIC] No reducer in logic!', logicClass.path, logicClass)
            console.trace()
            return
          }

          const [, sceneName, logicName] = path

          if (!this.loadedReducers[sceneName]) {
            this.loadedReducers[sceneName] = {}
          }

          if (!this.loadedReducers[sceneName][logicName]) {
            this.loadedReducers[sceneName][logicName] = logicClass.reducer
          }
        })
      })

      let combinedReducers = {}

      Object.keys(this.loadedReducers).forEach(sceneName => {
        combinedReducers[sceneName] = combineReducers(this.loadedReducers[sceneName])
      })

      this.replaceReducer(createCombinedKeaReducer(combinedReducers, appReducers))
    }

    this.dispatch({
      type: NEW_SCENE,
      payload: {
        name,
        background
      }
    })

    this.currentScene = name
  }

  return store
}
