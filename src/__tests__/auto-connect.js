/* global test, expect */
import { kea, resetContext } from '../index'

import './helper/jsdom'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

test('other logic gets connected and mounted automatically when used in e.g. reducers', () => {
  resetContext({ createStore: true, autoMount: false })

  const thirdLogic = kea({
    actions: () => ({
      thirdAction: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      thirdName: ['third', {
        [actions.thirdAction]: (_, { name }) => name
      }]
    })
  })

  const secondLogic = kea({
    actions: () => ({
      secondAction: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      secondName: ['second', {
        [actions.secondAction]: (_, { name }) => name,
        [thirdLogic.actions.thirdAction]: (_, { name }) => name
      }]
    })
  })

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name })
    }),

    reducers: ({ actions }) => ({
      name: ['first', {
        [actions.updateName]: (_, { name }) => name,
        [secondLogic.actions.secondAction]: (_, { name }) => name
      }]
    })
  })

  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(secondLogic.values.secondName).toEqual('second')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount1()

  const unmount2 = secondLogic.mount()

  expect(() => { logic.values.name }).toThrow() // eslint-disable-line
  expect(secondLogic.values.secondName).toEqual('second')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount2()

  const unmount3 = thirdLogic.mount()

  expect(() => { logic.values.name }).toThrow() // eslint-disable-line
  expect(() => { secondLogic.values.secondName }).toThrow() // eslint-disable-line
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount3()

  expect(() => { logic.values.name }).toThrow() // eslint-disable-line
  expect(() => { secondLogic.values.secondName }).toThrow() // eslint-disable-line
  expect(() => { thirdLogic.values.secondName }).toThrow() // eslint-disable-line
})
