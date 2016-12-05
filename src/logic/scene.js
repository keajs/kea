import { combineReducers } from 'redux'
import { createCombinedSaga } from './saga'

class KeaScene {
  constructor ({ name, logic, sagas, component }) {
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

export function createScene (args) {
  return new KeaScene(args)
}
