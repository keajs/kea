import { createSaga } from 'kea'
// import { put } from 'redux-saga/effects'
//
// import $$camelComponent$$Logic from '~/scenes/$$dash-scene$$/$$path-component$$/logic'

export default createSaga({
  // actions: () => ([
  //   $$camelComponent$$Logic, [
  //     'doSomething'
  //   ]
  // ]),

  // takeEvery: ({ actions }) => ({
  //   [actions.doSomething]: this.doSomethingWorker
  // }),

  // start: function * () {
  //    const { doSomething } = this.actions
  //
  //   console.log('Starting $$camelScene$$ $$camelComponent$$ saga')
  //
  //   while (true) {
  //     const propertyName = yield $$camelComponent$$Logic.get('propertyName')
  //     yield put(doSomething(propertyName + '!'))
  //   }
  // },

  // stop: function * () {
  //   console.log('Stopping $$camelScene$$ $$camelComponent$$ saga')
  // },

  // doSomethingWorker: function * (action) {
  //   const { variable } = action.payload
  //   const propertyName = yield $$camelComponent$$Logic.get('propertyName')
  //   console.log('doSomething action called with', variable)
  // }
})
