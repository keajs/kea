import { take, fork, cancel } from 'redux-saga/effects'

export function createCombinedSaga (sagas) {
  return function * () {
    let workers = []
    try {
      for (let i = 0; i < sagas.length; i++) {
        const worker = yield fork(sagas[i])
        workers.push(worker)
      }

      while (true) {
        yield take('wait until worker cancellation')
      }
    } catch (error) {
      for (let i = 0; i < workers.length; i++) {
        yield cancel(workers[i])
      }
    }
  }
}
