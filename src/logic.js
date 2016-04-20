import { select } from 'redux-saga/effects'

import { pathSelector } from './selectors'

class KeaLogic {
  // path,
  // actions
  // constants
  // saga
  // reducer
  // selectors
  constructor (args) {
    Object.keys(args).forEach(key => {
      this[key] = args[key]
    })

    if (!this.selector && this.path) {
      this.selector = (state) => pathSelector(this.path, state)
    }
  }

  * get (key) {
    return yield select(key ? this.selectors[key] : this.selector)
  }

  * fetch () {
    let results = {}

    const keys = Array.isArray(arguments[0]) ? arguments[0] : arguments

    for (let i = 0; i < keys.length; i++) {
      results[keys[i]] = yield this.get(keys[i])
    }

    return results
  }
}

export function createLogic (args) {
  return new KeaLogic(args)
}
