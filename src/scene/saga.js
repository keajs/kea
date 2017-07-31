import { take, fork, cancel, cancelled } from 'redux-saga/effects'

const DEBUG = false

let runningSagas = {}

export function clearRunningSagas () {
  runningSagas = {}
}

export function createCombinedSaga (sagas, sagaPath = undefined) {
  return function * () {
    if (DEBUG) {
      console.log(`Starting ${sagaPath}`)
    }
    if (sagaPath && runningSagas[sagaPath]) {
      if (DEBUG) {
        console.log(`Already running ${sagaPath}`)
      }
      return
    } else {
      runningSagas[sagaPath] = true
    }

    let workers = []
    try {
      for (let i = 0; i < sagas.length; i++) {
        const worker = yield fork(sagas[i])
        workers.push(worker)
      }

      while (true) {
        yield take('wait until worker cancellation')
      }
    } finally {
      if (yield cancelled()) {
        for (let i = 0; i < workers.length; i++) {
          yield cancel(workers[i])
        }
      }
      delete runningSagas[sagaPath]
      if (DEBUG) {
        console.log(`Stopped ${sagaPath}`)
      }
    }
  }
}
