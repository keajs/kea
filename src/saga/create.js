import { call, cancelled, takeEvery, takeLatest } from 'redux-saga/effects'

let _gaveRunWarning = false
let _gaveCancelledWarning = false

// this = object with keys { takeEvery, takeLatest, start, stop }
// object = what is passed to the functions takeEvery and takeLatest, should have { actions }
export function createSaga (_this, object) {
  // generate the saga
  return function * () {
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
        if (!_gaveRunWarning) {
          console.warn('[KEA-LOGIC] run() is deprecated in sagas. Use start() instead.')
          _gaveRunWarning = true
        }
        yield call(_this.run)
      }
      if (_this.start) {
        yield call(_this.start)
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
