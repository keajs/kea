import { takeEvery, takeLatest } from 'redux-saga'
import { call, cancelled } from 'redux-saga/effects'

import { selectActionsFromLogic } from '../logic'

class Saga {
  init () {
    let object = {}
    object.actions = this.actions ? selectActionsFromLogic(this.actions(object)) : {}
    Object.assign(this, object)

    const _this = this

    return function * () {
      try {
        // run takeEvery and takeLatest
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
                  yield ops[op](keys[i], fn[j].bind(_this))
                }
              } else {
                yield ops[op](keys[i], fn.bind(_this))
              }
            }
          }
        }

        // call the run function
        if (_this.run) {
          yield call(_this.run.bind(_this))
        }
      } finally {
        // call the cancelled function if cancelled
        if (yield cancelled()) {
          if (_this.cancelled) {
            yield call(_this.cancelled.bind(_this))
          }
        }
      }
    }
  }
}

Saga._isKeaSagaClass = true

export default Saga
