import { takeEvery, takeLatest } from 'redux-saga'
import { spawn } from 'redux-saga/effects'

import { selectActionsFromLogic } from '../logic'

export default class Saga {
  init () {
    let object = {}
    object.actions = this.actions ? selectActionsFromLogic(this.actions(object)) : {}
    Object.assign(this, object)

    const _this = this

    return function * () {
      // console.log(this, _this, object)

      // run the run function
      if (_this.run) {
        yield spawn(_this.run.bind(_this))
      }

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
    }
  }
}
