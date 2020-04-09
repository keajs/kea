/* global test, expect */
import { kea, resetContext } from '../index'

import './helper/jsdom'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

test('other logic gets connected and mounted automatically when used in reducers', () => {
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

test('other logic gets connected and mounted automatically when used in selectors', () => {
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
        [actions.secondAction]: (_, { name }) => name
      }]
    }),

    selectors: ({ selectors }) => ({
      combinedName: [
        () => [selectors.secondName, thirdLogic.selectors.thirdName],
        (secondName, thirdName) => `${secondName}.${thirdName}`
      ]
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
    }),

    selectors: ({ selectors }) => ({
      combinedName: [
        () => [selectors.name, secondLogic.selectors.combinedName],
        (name, combinedName) => `${name}.${combinedName}`
      ]
    })
  })

  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(logic.values.combinedName).toEqual('first.second.third')
  expect(secondLogic.values.secondName).toEqual('second')
  expect(secondLogic.values.combinedName).toEqual('second.third')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount1()

  const unmount2 = secondLogic.mount()

  expect(() => { logic.values.name }).toThrow() // eslint-disable-line
  expect(() => { logic.values.combinedName }).toThrow() // eslint-disable-line
  expect(secondLogic.values.secondName).toEqual('second')
  expect(secondLogic.values.combinedName).toEqual('second.third')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount2()

  const unmount3 = thirdLogic.mount()

  expect(() => { logic.values.name }).toThrow() // eslint-disable-line
  expect(() => { logic.values.combinedName }).toThrow() // eslint-disable-line
  expect(() => { secondLogic.values.secondName }).toThrow() // eslint-disable-line
  expect(() => { secondLogic.values.combinedName }).toThrow() // eslint-disable-line
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount3()

  expect(() => { logic.values.name }).toThrow() // eslint-disable-line
  expect(() => { logic.values.combinedName }).toThrow() // eslint-disable-line
  expect(() => { secondLogic.values.secondName }).toThrow() // eslint-disable-line
  expect(() => { secondLogic.values.combinedName }).toThrow() // eslint-disable-line
  expect(() => { thirdLogic.values.thirdName }).toThrow() // eslint-disable-line
})
