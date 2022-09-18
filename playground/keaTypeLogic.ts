import { kea, actions, reducers, selectors } from '../src'
import { KeaType } from '../src'

export type keaTypeLogicType = KeaType<{
  actions: {
    doSomething: () => void
    makeMeSomething: (value: string) => { value: string }
  }
  values: {
    aString: string
    aNumber: number
    selectedValue: boolean
  }
}>

export const keaTypeLogic = kea<keaTypeLogicType>([
  actions({
    doSomething: () => null,
    makeMeSomething: (value) => ({ value }),
  }),
  reducers({
    aNumber: [2, {}],
    aString: ['', { makeMeSomething: () => 'no' }],
  }),
  selectors({
    selectedValue: [
      (s) => [s.aNumber],
      (valueType) => !!valueType
    ],
  }),
])

keaTypeLogic.actions.doSomething()
keaTypeLogic.actions.makeMeSomething('haha')
