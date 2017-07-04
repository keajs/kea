import { createSaga } from './create'
export { createSaga } from './create'

class Saga {
  constructor () {
    this._saga = null
  }

  init () {
    // no need to re-create the function
    if (this._saga) {
      return this._saga
    }

    // create actions object
    let object = {}

    // generate the saga
    this._saga = createSaga(this, object)

    return this._saga
  }
}

Saga._isKeaSagaClass = true

export default Saga
