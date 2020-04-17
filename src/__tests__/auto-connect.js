/* global test, expect */
import { getContext, kea, resetContext } from '../index'

import './helper/jsdom'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

test('other logic gets connected and mounted automatically when used in reducers via build', () => {
  resetContext({ createStore: true, autoMount: false })

  const thirdLogic = kea({
    path: () => ['autoConnect', 'third'],
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
    path: () => ['autoConnect', 'second'],
    actions: () => ({
      secondAction: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      secondName: ['second', {
        [actions.secondAction]: (_, { name }) => name,
        [thirdLogic().actions.thirdAction]: (_, { name }) => name
      }]
    })
  })

  const logic = kea({
    path: () => ['autoConnect', 'first'],
    actions: () => ({
      updateName: name => ({ name })
    }),

    reducers: ({ actions }) => ({
      name: ['first', {
        [actions.updateName]: (_, { name }) => name,
        [secondLogic().actions.secondAction]: (_, { name }) => name
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

test('other logic gets connected and mounted automatically when used in reducers via build in random order', () => {
  resetContext({ createStore: true, autoMount: false })

  const thirdLogic = kea({
    path: () => ['autoConnect', 'third'],
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
    path: () => ['autoConnect', 'second'],
    actions: () => ({
      secondAction: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      secondName: ['second', {
        [actions.secondAction]: (_, { name }) => name,
        [thirdLogic().actions.thirdAction]: (_, { name }) => name
      }]
    })
  })

  // this is different compared to previous test, e.g. not all gets built immediately on first mount()
  secondLogic.build()

  const logic = kea({
    path: () => ['autoConnect', 'first'],
    actions: () => ({
      updateName: name => ({ name })
    }),

    reducers: ({ actions }) => ({
      name: ['first', {
        [actions.updateName]: (_, { name }) => name,
        [secondLogic().actions.secondAction]: (_, { name }) => name
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

test('other logic gets connected and mounted automatically when used in reducers via wrapper', () => {
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

test('other logic gets connected and mounted automatically when used in reducers via wrapper in random order', () => {
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

  // this is different compared to previous test, e.g. not all gets built immediately on first mount()
  thirdLogic.build()
  secondLogic.build()

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

  expect(() => { logic.values.name }).toThrow() // eslint-disable-line
  expect(() => { secondLogic.values.secondName }).toThrow() // eslint-disable-line
  expect(() => { thirdLogic.values.secondName }).toThrow() // eslint-disable-line

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

test('other logic gets connected and mounted automatically when used in listeners as key', () => {
  resetContext({ createStore: true, autoMount: false })

  const secondLogic = kea({
    actions: () => ({
      secondAction: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      secondName: ['second', {
        [actions.secondAction]: (_, { name }) => name
      }]
    })
  })

  let nameFromAction = ''

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name })
    }),

    reducers: ({ actions }) => ({
      name: ['first', {
        [actions.updateName]: (_, { name }) => name
      }]
    }),

    listeners: () => ({
      [secondLogic.actions.secondAction]: ({ name }) => {
        nameFromAction = name
      }
    })
  })

  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(secondLogic.values.secondName).toEqual('second')

  expect(nameFromAction).toEqual('')

  secondLogic.actions.secondAction('new name')

  expect(nameFromAction).toEqual('new name')

  unmount1()

  expect(() => { logic.values.name }).toThrow() // eslint-disable-line
  expect(() => { secondLogic.values.secondName }).toThrow() // eslint-disable-line
})

test('other logic gets connected and mounted automatically when called inside listeners', () => {
  resetContext({ createStore: true, autoMount: false })

  let nameFromAction = ''

  const secondLogic = kea({
    actions: () => ({
      secondAction: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      secondName: ['second', {
        [actions.secondAction]: (_, { name }) => name
      }]
    }),
    listeners: ({ actions }) => ({
      [actions.secondAction]: ({ name }) => {
        nameFromAction = name
      }
    })
  })

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name })
    }),

    reducers: ({ actions }) => ({
      name: ['first', {
        [actions.updateName]: (_, { name }) => name
      }]
    }),

    listeners: ({ actions }) => ({
      [actions.updateName]: ({ name }) => {
        secondLogic.actions.secondAction('new name')
      }
    })
  })

  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(() => { secondLogic.values.secondName }).toThrow() // eslint-disable-line

  expect(nameFromAction).toEqual('')

  logic.actions.updateName('new name')
  expect(secondLogic.values.secondName).toEqual('new name')

  expect(nameFromAction).toEqual('new name')

  unmount1()

  expect(() => { logic.values.name }).toThrow() // eslint-disable-line
  expect(() => { secondLogic.values.secondName }).toThrow() // eslint-disable-line
})

test('other logic gets connected and mounted automatically when called inside listeners, even if old got separately mounted', () => {
  resetContext({ createStore: true, autoMount: false })

  let nameFromAction = ''

  const secondLogic = kea({
    actions: () => ({
      secondAction: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      secondName: ['second', {
        [actions.secondAction]: (_, { name }) => name
      }]
    }),
    listeners: ({ actions }) => ({
      [actions.secondAction]: ({ name }) => {
        nameFromAction = name
      }
    })
  })

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name })
    }),

    reducers: ({ actions }) => ({
      name: ['first', {
        [actions.updateName]: (_, { name }) => name
      }]
    }),

    listeners: ({ actions }) => ({
      [actions.updateName]: ({ name }) => {
        secondLogic.actions.secondAction('new name')
      }
    })
  })

  const unmountSecond = secondLogic.mount()
  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(secondLogic.values.secondName).toEqual('second') // eslint-disable-line

  expect(nameFromAction).toEqual('')

  logic.actions.updateName('new name')

  unmountSecond()

  expect(secondLogic.values.secondName).toEqual('new name')

  expect(nameFromAction).toEqual('new name')

  unmount1()

  expect(() => { logic.values.name }).toThrow() // eslint-disable-line
  expect(() => { secondLogic.values.secondName }).toThrow() // eslint-disable-line
})

test('mounting logic manually inside listeners works as expected', () => {
  resetContext({ createStore: true, autoMount: false })

  let nameFromAction = ''

  const secondLogic = kea({
    actions: () => ({
      secondAction: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      secondName: ['second', {
        [actions.secondAction]: (_, { name }) => name
      }]
    }),
    listeners: ({ actions }) => ({
      [actions.secondAction]: ({ name }) => {
        nameFromAction = name
      }
    })
  })

  let listenerRan = false

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name })
    }),

    reducers: ({ actions }) => ({
      name: ['first', {
        [actions.updateName]: (_, { name }) => name
      }]
    }),

    listeners: ({ actions }) => ({
      [actions.updateName]: ({ name }) => {
        // can run inside a listener and unmount, if passed `autoConnect = false`
        // without it, calling build connects it to the `logic` and mount automatically
        // the manual .mount() would just mount it twice
        const builtLogic = secondLogic.build({}, false)
        const unmount = builtLogic.mount()
        builtLogic.actions.secondAction('new name')
        expect(builtLogic.values.secondName).toBe('new name')
        unmount()

        listenerRan = true
      }
    })
  })

  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(() => { secondLogic.values.secondName }).toThrow() // eslint-disable-line

  expect(nameFromAction).toEqual('')

  logic.actions.updateName('new name')

  expect(listenerRan).toBe(true)

  expect(() => { secondLogic.values.secondName }).toThrow() // eslint-disable-line

  expect(nameFromAction).toEqual('new name')

  unmount1()

  expect(() => { logic.values.name }).toThrow() // eslint-disable-line
  expect(() => { secondLogic.values.secondName }).toThrow() // eslint-disable-line
})

test('listeners are removed from the run heap, even if they throw', () => {
  resetContext({ createStore: true, autoMount: false })

  let listenerStarted = false

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name })
    }),

    reducers: ({ actions }) => ({
      name: ['first', {
        [actions.updateName]: (_, { name }) => name
      }]
    }),

    listeners: ({ actions }) => ({
      [actions.updateName]: ({ name }) => {
        expect(getContext().run.heap.length).toBe(1)
        listenerStarted = true
        throw new Error('Throwing in listener')
      }
    })
  })

  const unmount = logic.mount()

  expect(logic.values.name).toEqual('first')

  expect(getContext().run.heap.length).toBe(0)

  expect(() => {
    logic.actions.updateName('new name')
  }).toThrow('Throwing in listener')

  expect(getContext().run.heap.length).toBe(0)
  expect(listenerStarted).toBe(true)

  unmount()

  expect(() => { logic.values.name }).toThrow() // eslint-disable-line
})
