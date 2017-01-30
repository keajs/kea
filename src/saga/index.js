import { call, cancelled, takeEvery, takeLatest } from 'redux-saga/effects'

import { selectActionsFromLogic } from '../logic'

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

    const _this = this

    // generate the saga
    this._saga = function * () {
      try {
        // start takeEvery and takeLatest watchers
        let ops = { takeEvery, takeLatest }
        let opKeys = Object.keys(ops)
        for (let k = 0; k < opKeys.length; k++) {
          var op = opKeys[k]
          if (_this[op]) {
            let list = _this[op](object)

            let keys = Object.keys(list)
            for (let i = 0; i < keys.length; i++) {
              let fn = list[keys[i]]
              if (Array.isArray(fn)) {
                for (let j = 0; j < fn.length; j++) {
                  yield ops[op](keys[i], fn[j])
                }
              } else {
                yield ops[op](keys[i], fn)
              }
            }
          }
        }

        // call the run function
        if (_this.run) {
          yield call(_this.run)
        }
      } finally {
        // call the cancelled function if cancelled
        if (yield cancelled()) {
          if (_this.cancelled) {
            yield call(_this.cancelled)
          }
        }
      }
    }

    return this._saga
  }
}

Saga._isKeaSagaClass = true

export default Saga
