import { call, take, cancel, fork } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'

let emitter
let cancelCounter = 1
let toCancel = {}

function createComponentChannel (socket) {
  return eventChannel(emit => {
    emitter = emit
    return () => {}
  })
}

export function * keaSaga () {
  const channel = yield call(createComponentChannel)

  while (true) {
    const { startSaga, cancelSaga, saga, counter } = yield take(channel)
    if (startSaga) {
      toCancel[counter] = yield fork(saga)
    }
    if (cancelSaga) {
      yield cancel(toCancel[counter])
    }
  }
}

export function startSaga (saga) {
  if (emitter) {
    cancelCounter += 1
    emitter({ startSaga: true, saga, counter: cancelCounter })
    return cancelCounter
  }

  return null
}

export function cancelSaga (counter) {
  if (emitter) {
    emitter({ cancelSaga: true, counter })
  }
}
