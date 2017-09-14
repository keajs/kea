import { combineReducers } from 'redux'
import { createCombinedSaga } from './saga'

let deprecationWarning = false

export class Scene {
  constructor ({ name, logic, sagas, component }) {
    if (process.env.NODE_ENV !== 'production') {
      if (!deprecationWarning) {
        deprecationWarning = true
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

export function createScene (args) {
  return new Scene(args)
}
