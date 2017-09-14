import { call, cancelled, take, takeEvery, takeLatest } from 'redux-saga/effects'
import { selectActionsFromLogic } from '../../logic/actions'

let _gaveRunWarning = false
let _gaveCancelledWarning = false

// this = object with keys { takeEvery, takeLatest, start, stop }
// object = what is merged into _this after actions are created
export default function createSaga (_this, object = {}) {
  // bind all functions to _this
  const keys = Object.keys(_this)
  for (let i = 0; i < keys.length; i++) {
    if (typeof _this[keys[i]] === 'function') {
      _this[keys[i]] = _this[keys[i]].bind(_this)
    }
  }

  if (_this.workers) {
    const keys = Object.keys(_this.workers)
    for (let i = 0; i < keys.length; i++) {
      if (typeof _this.workers[keys[i]] === 'function') {
        _this.workers[keys[i]] = _this.workers[keys[i]].bind(_this)
      }
    }
  }

  object.actions = _this.actions ? selectActionsFromLogic(_this.actions(object)) : (object.actions || {})
  Object.assign(_this, object)

  // generate the saga
  return function * () {
    try {
      // start takeEvery and takeLatest watchers
      let ops = { takeEvery, takeLatest }
      let opKeys = Object.keys(ops)
      for (let k = 0; k < opKeys.length; k++) {
        var op = opKeys[k]
        if (_this[op]) {
          let list = _this[op](_this)

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
        if (!_gaveRunWarning) {
          console.warn('[KEA-LOGIC] run() is deprecated in sagas. Use start() instead.')
          _gaveRunWarning = true
        }
        yield call(_this.run)
      }
      if (_this.start) {
        yield call(_this.start)
      }

      if (_this.stop || _this.cancelled) {
        while (true) {
          yield take('wait until worker cancellation')
        }
      }
    } finally {
      // call the cancelled function if cancelled
      if (yield cancelled()) {
        if (_this.cancelled) {
          if (!_gaveCancelledWarning) {
            console.warn('[KEA-LOGIC] cancelled() is deprecated in sagas. Use stop() instead.')
            _gaveCancelledWarning = true
          }
          yield call(_this.cancelled)
        }
        if (_this.stop) {
          yield call(_this.stop)
        }
      }
    }
  }
}
