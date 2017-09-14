import { take, fork, cancel, cancelled } from 'redux-saga/effects'

import { getCache, setCache } from '../kea/cache'

const DEBUG = false

export function createCombinedSaga (sagas, sagaPath = undefined) {
  return function * () {
    if (DEBUG) {
      console.log(`Starting ${sagaPath}`)
    }
    if (sagaPath && getCache(sagaPath, 'sagaRunning')) {
      if (DEBUG) {
        console.log(`Already running ${sagaPath}`)
      }
      return
    } else {
      setCache(sagaPath, { sagaRunning: true })
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
      setCache(sagaPath, { sagaRunning: false })
      if (DEBUG) {
        console.log(`Stopped ${sagaPath}`)
      }
    }
  }
}
