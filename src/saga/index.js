import { selectActionsFromLogic } from '../logic'
import { createSaga } from './create'

class Saga {
  constructor () {
    this._saga = null
  }

  init () {
    // no need to re-create the function
    if (this._saga) {
      return this._saga
    }

    // bind all functions to this
    const keys = Object.keys(this)
    for (let i = 0; i < keys.length; i++) {
      if (typeof this[keys[i]] === 'function') {
        this[keys[i]] = this[keys[i]].bind(this)
      }
    }

    // create actions object
    let object = {}
    object.actions = this.actions ? selectActionsFromLogic(this.actions(object)) : {}
    Object.assign(this, object)

    // generate the saga
    this._saga = createSaga(this, object)

    return this._saga
  }
}

Saga._isKeaSagaClass = true

export default Saga
