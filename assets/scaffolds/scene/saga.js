import Saga from 'kea/saga'
// import { put } from 'redux-saga/effects'

// import $$camelScene$$Logic from '~/scenes/$$dash-scene$$/logic'

export default class $$CapitalScene$$Saga extends Saga {
  // actions = () => ([
  //   $$camelScene$$Logic, [
  //     'doSomething'
  //   ]
  // ])

  // takeEvery = ({ actions }) => ({
  //   [actions.doSomething]: this.doSomethingWorker
  // })

  // run = function * () {
  //   const { doSomething } = this.actions
  //
  //   console.log('Starting $$camelScene$$ saga')
  //
  //   while (true) {
  //     const propertyName = yield $$camelScene$$Logic.get('propertyName')
  //     yield put(doSomething(propertyName + '!'))
  //   }
  // }

  // cancelled = function * () {
  //   console.log('Stopping $$camelScene$$ saga')
  // }

  // doSomethingWorker = function * (action) {
  //   const { variable } = action.payload
  //   const propertyName = yield $$camelComponent$$Logic.get('propertyName')
  //   console.log('doSomething action called with', variable)
  // }
}
