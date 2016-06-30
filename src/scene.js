import { createCombinedSaga } from './saga'

class KeaScene {
  constructor ({ name, logic, sagas, component }) {
    this.name = name
    this.logic = logic || []
    this.sagas = sagas || []
    this.component = component

    if (this.sagas) {
      this.worker = createCombinedSaga(this.sagas)
    }
  }
}

export function createScene (args) {
  return new KeaScene(args)
}
