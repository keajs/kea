import { combineReducers } from 'redux'
import createCombinedSaga from '../kea/saga/create-combined'
import { call, take, cancel, fork } from 'redux-saga/effects'
import { addReducer, regenerateRootReducer } from '../kea/reducer'

// Scene
let sceneDeprecationWarning = true

export class Scene {
  constructor ({ name, logic, sagas, component }) {
    if (process.env.NODE_ENV !== 'production') {
      if (!sceneDeprecationWarning) {
        sceneDeprecationWarning = true
        console.warn('[KEA/SCENE] Scenes have been deprecated! Please upgrade to Redux Router v4 and the new @kea({}) syntax. See: https://github.com/keajs/kea-example/compare/a71ad02ae900819b4e8ae55590100e97dd09c2ea...77089545094efc4f3310e7a7c31862be56704b22')
      }
    }
    this.name = name
    this.logic = logic || []
    this.sagas = sagas ? sagas.map(Saga => Saga._isKeaSagaClass ? new Saga().init() : Saga) : []
    this.component = component

    if (this.sagas) {
      this.worker = createCombinedSaga(this.sagas)
      this.saga = this.worker
    }
  }

  combineReducers () {
    let sceneReducers = {}
    this.logic.forEach(logic => {
      sceneReducers[logic.path[logic.path.length - 1]] = logic.reducer
    })
    return combineReducers(sceneReducers)
  }
}

Scene._isKeaSceneClass = true

// createScene
export function createScene (args) {
  return new Scene(args)
}

// add reducers and sagas from the scene into the state
let loadedScenes = {} // all loaded scenes
let loadedWorkers = {}
let currentScene = null
export const NEW_SCENE = '@@kea/NEW_SCENE'

let addSceneDeprecationWarning = false

export function * deprecatedSceneSaga (appSagas = null) {
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

export function addKeaScene (scene, background = false, store = null) {
  if (!scene) {
    return
  }

  const { name } = scene

  if (currentScene === name) {
    return
  }

  if (process.env.NODE_ENV !== 'production') {
    if (!addSceneDeprecationWarning) {
      addSceneDeprecationWarning = true
      console.warn('[KEA/SCENE] Scenes have been deprecated! Please upgrade to Redux Router v4 and the new @kea({}) syntax. See: https://github.com/keajs/kea-example/compare/a71ad02ae900819b4e8ae55590100e97dd09c2ea...77089545094efc4f3310e7a7c31862be56704b22')
    }
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

export function createRootSaga (appSagas = null) {
  return function * () {
    yield call(deprecatedSceneSaga, appSagas)
  }
}

// routes
function lazyLoad (store, lazyLoadableModule) {
  return (location, cb) => {
    lazyLoadableModule(module => {
      const scene = module.default
      addKeaScene(scene, false, store)
      cb(null, scene.component)
    })
  }
}

export function getRoutes (App, store, routes) {
  return {
    component: App,
    childRoutes: Object.keys(routes).map(route => ({
      path: route,
      getComponent: lazyLoad(store, routes[route])
    }))
  }
}

export function combineScenesAndRoutes (scenes, routes) {
  let combined = {}

  Object.keys(routes).forEach(route => {
    if (scenes[routes[route]]) {
      combined[route] = scenes[routes[route]]
    } else {
      console.error(`[KEA-LOGIC] scene ${routes[route]} not found in scenes object (route: ${route})`)
    }
  })

  return combined
}
