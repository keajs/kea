import { kea } from '../kea/kea'
import { logic as LogicType } from './logic.d'

export const logic = kea<LogicType>({
  actions: () => ({
    doit: true,
    doitAgain: true,
  }),

  reducers: () => ({
    somethingDone: [false, { doit: () => true, doItAgainTypo: () => true }],
  }),

  bla: true,
})
