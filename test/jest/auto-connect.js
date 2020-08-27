/* global test, expect */
import { getContext, kea, resetContext } from '../../src'

import './helper/jsdom'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

test('other logic is connected and mounted automatically when used in reducers via build', () => {
  resetContext({ createStore: true, autoMount: false })

  const thirdLogic = kea({
    path: () => ['autoConnect', 'third'],
    actions: () => ({
      thirdAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      thirdName: [
        'third',
        {
          [actions.thirdAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const secondLogic = kea({
    path: () => ['autoConnect', 'second'],
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
          [thirdLogic().actions.thirdAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const logic = kea({
    path: () => ['autoConnect', 'first'],
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
          [secondLogic().actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(secondLogic.values.secondName).toEqual('second')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount1()

  const unmount2 = secondLogic.mount()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(secondLogic.values.secondName).toEqual('second')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount2()

  const unmount3 = thirdLogic.mount()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount3()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
  expect(() => {
    thirdLogic.values.thirdName
  }).toThrow() // eslint-disable-line
})

test('other logic is connected and mounted automatically when used in reducers via build in random order', () => {
  resetContext({ createStore: true, autoMount: false })

  const thirdLogic = kea({
    path: () => ['autoConnect', 'third'],
    actions: () => ({
      thirdAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      thirdName: [
        'third',
        {
          [actions.thirdAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const secondLogic = kea({
    path: () => ['autoConnect', 'second'],
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
          [thirdLogic().actions.thirdAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  // this is different compared to previous test, e.g. not all is built immediately on first mount()
  secondLogic.build()

  const logic = kea({
    path: () => ['autoConnect', 'first'],
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
          [secondLogic().actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(secondLogic.values.secondName).toEqual('second')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount1()

  const unmount2 = secondLogic.mount()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(secondLogic.values.secondName).toEqual('second')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount2()

  const unmount3 = thirdLogic.mount()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount3()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
  expect(() => {
    thirdLogic.values.thirdName
  }).toThrow() // eslint-disable-line
})

test('other logic is connected and mounted automatically when used in reducers via wrapper', () => {
  resetContext({ createStore: true, autoMount: false })

  const thirdLogic = kea({
    actions: () => ({
      thirdAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      thirdName: [
        'third',
        {
          [actions.thirdAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const secondLogic = kea({
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
          [thirdLogic.actions.thirdAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
          [secondLogic.actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(secondLogic.values.secondName).toEqual('second')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount1()

  const unmount2 = secondLogic.mount()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(secondLogic.values.secondName).toEqual('second')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount2()

  const unmount3 = thirdLogic.mount()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount3()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
  expect(() => {
    thirdLogic.values.thirdName
  }).toThrow() // eslint-disable-line
})

test('other logic is connected and mounted automatically when used in reducers via wrapper in random order', () => {
  resetContext({ createStore: true, autoMount: false })

  const thirdLogic = kea({
    actions: () => ({
      thirdAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      thirdName: [
        'third',
        {
          [actions.thirdAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const secondLogic = kea({
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
          [thirdLogic.actions.thirdAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  // this is different compared to previous test, e.g. not all is built immediately on first mount()
  thirdLogic.build()
  secondLogic.build()

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
          [secondLogic.actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
  expect(() => {
    thirdLogic.values.thirdName
  }).toThrow() // eslint-disable-line

  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(secondLogic.values.secondName).toEqual('second')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount1()

  const unmount2 = secondLogic.mount()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(secondLogic.values.secondName).toEqual('second')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount2()

  const unmount3 = thirdLogic.mount()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount3()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
  expect(() => {
    thirdLogic.values.thirdName
  }).toThrow() // eslint-disable-line
})

test('other logic is connected and mounted automatically when used in selectors', () => {
  resetContext({ createStore: true, autoMount: false })

  const thirdLogic = kea({
    actions: () => ({
      thirdAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      thirdName: [
        'third',
        {
          [actions.thirdAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const secondLogic = kea({
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),

    selectors: ({ selectors }) => ({
      combinedName: [
        () => [selectors.secondName, thirdLogic.selectors.thirdName],
        (secondName, thirdName) => `${secondName}.${thirdName}`,
      ],
    }),
  })

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
          [secondLogic.actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),

    selectors: ({ selectors }) => ({
      combinedName: [
        () => [selectors.name, secondLogic.selectors.combinedName],
        (name, combinedName) => `${name}.${combinedName}`,
      ],
    }),
  })

  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(logic.values.combinedName).toEqual('first.second.third')
  expect(secondLogic.values.secondName).toEqual('second')
  expect(secondLogic.values.combinedName).toEqual('second.third')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount1()

  const unmount2 = secondLogic.mount()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    logic.values.combinedName
  }).toThrow() // eslint-disable-line
  expect(secondLogic.values.secondName).toEqual('second')
  expect(secondLogic.values.combinedName).toEqual('second.third')
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount2()

  const unmount3 = thirdLogic.mount()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    logic.values.combinedName
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.combinedName
  }).toThrow() // eslint-disable-line
  expect(thirdLogic.values.thirdName).toEqual('third')

  unmount3()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    logic.values.combinedName
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.combinedName
  }).toThrow() // eslint-disable-line
  expect(() => {
    thirdLogic.values.thirdName
  }).toThrow() // eslint-disable-line
})

test('other logic is connected and mounted automatically when used in listeners as key', () => {
  resetContext({ createStore: true, autoMount: false })

  const secondLogic = kea({
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  let nameFromAction = ''

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
        },
      ],
    }),

    listeners: () => ({
      [secondLogic.actions.secondAction]: ({ name }) => {
        nameFromAction = name
      },
    }),
  })

  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(secondLogic.values.secondName).toEqual('second')

  expect(nameFromAction).toEqual('')

  secondLogic.actions.secondAction('new name')

  expect(nameFromAction).toEqual('new name')

  unmount1()

  expect(getContext().mount.counter).toEqual({})

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
})

test('other logic is connected and mounted automatically when called inside listeners', () => {
  resetContext({ createStore: true, autoMount: false })

  let nameFromAction = ''

  const secondLogic = kea({
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),
    listeners: ({ actions }) => ({
      [actions.secondAction]: ({ name }) => {
        nameFromAction = name
      },
    }),
  })

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
        },
      ],
    }),

    listeners: ({ actions }) => ({
      [actions.updateName]: ({ name }) => {
        secondLogic.actions.secondAction('new name')
      },
    }),
  })

  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line

  expect(nameFromAction).toEqual('')

  logic.actions.updateName('new name')
  expect(secondLogic.values.secondName).toEqual('new name')

  expect(nameFromAction).toEqual('new name')

  unmount1()
  expect(getContext().mount.counter).toEqual({})

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
})

test('other logic is connected and mounted automatically when called inside listeners, even if old got separately mounted', () => {
  resetContext({ createStore: true, autoMount: false })

  let nameFromAction = ''

  const secondLogic = kea({
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),
    listeners: ({ actions }) => ({
      [actions.secondAction]: ({ name }) => {
        nameFromAction = name
      },
    }),
  })

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
        },
      ],
    }),

    listeners: ({ actions }) => ({
      [actions.updateName]: ({ name }) => {
        secondLogic.actions.secondAction('new name')
      },
    }),
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
  expect(getContext().mount.counter).toEqual({})

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
})

test('mounting logic manually inside listeners works as expected', () => {
  resetContext({ createStore: true, autoMount: false })

  let nameFromAction = ''

  const secondLogic = kea({
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),
    listeners: ({ actions }) => ({
      [actions.secondAction]: ({ name }) => {
        nameFromAction = name
      },
    }),
  })

  let listenerRan = false

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
        },
      ],
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
      },
    }),
  })

  const unmount1 = logic.mount()

  expect(logic.values.name).toEqual('first')
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line

  expect(nameFromAction).toEqual('')

  logic.actions.updateName('new name')

  expect(listenerRan).toBe(true)

  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line

  expect(nameFromAction).toEqual('new name')

  unmount1()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic.values.secondName
  }).toThrow() // eslint-disable-line
})

test('listeners are removed from the run heap, even if they throw', () => {
  resetContext({ createStore: true, autoMount: false })

  let listenerStarted = false
  let otherListenerRan = false

  const otherLogic = kea({
    actions: () => ({ myAction: true }),
    listeners: ({ actions }) => ({
      myAction: () => {
        expect(getContext().run.heap.length).toBe(4)
        expect(getContext().run.heap.filter(h => h.type === 'listener').length).toBe(2)
        otherListenerRan = true
      },
    }),
  })

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
        },
      ],
    }),

    listeners: ({ actions }) => ({
      [actions.updateName]: ({ name }) => {
        expect(getContext().run.heap.length).toBe(2)
        expect(getContext().run.heap.filter(h => h.type === 'listener').length).toBe(1)
        listenerStarted = true
        otherLogic.actions.myAction()
        throw new Error('Throwing in listener')
      },
    }),
  })

  const unmount = logic.mount()

  expect(logic.values.name).toEqual('first')

  expect(getContext().run.heap.length).toBe(0)

  expect(() => {
    logic.actions.updateName('new name')
  }).toThrow('Throwing in listener')

  expect(getContext().run.heap.length).toBe(0)
  expect(listenerStarted).toBe(true)
  expect(otherListenerRan).toBe(true)

  unmount()

  expect(() => {
    logic.values.name
  }).toThrow() // eslint-disable-line
})

test('props work with autoConnect', () => {
  resetContext({ createStore: true, autoMount: false })

  const props = {
    id: '123',
    otherProp: 'why not',
  }

  const thirdLogic = kea({
    key: props => props.id,
    path: key => ['autoConnect', 'third', key],
    actions: () => ({
      thirdAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      thirdName: [
        'third',
        {
          [actions.thirdAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const thirdUnmount = thirdLogic(props).mount()

  const secondLogic = kea({
    key: props => props.id,
    path: key => ['autoConnect', 'second', key],
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions, props }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
          [thirdLogic(props).actions.thirdAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const logic = kea({
    key: props => props.id,
    path: key => ['autoConnect', 'first', key],
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions, props }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
          [secondLogic(props).actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const unmount1 = logic(props).mount()

  thirdUnmount()

  expect(logic(props).values.name).toEqual('first')
  expect(secondLogic(props).values.secondName).toEqual('second')
  expect(thirdLogic(props).values.thirdName).toEqual('third')

  unmount1()

  const unmount2 = secondLogic(props).mount()

  expect(() => {
    logic(props).values.name
  }).toThrow() // eslint-disable-line
  expect(secondLogic(props).values.secondName).toEqual('second')
  expect(thirdLogic(props).values.thirdName).toEqual('third')

  unmount2()

  const unmount3 = thirdLogic(props).mount()

  expect(() => {
    logic(props).values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic(props).values.secondName
  }).toThrow() // eslint-disable-line
  expect(thirdLogic(props).values.thirdName).toEqual('third')

  unmount3()

  expect(() => {
    logic(props).values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic(props).values.secondName
  }).toThrow() // eslint-disable-line
  expect(() => {
    thirdLogic(props).values.thirdName
  }).toThrow() // eslint-disable-line
})

test('props work with autoConnect listeners', () => {
  resetContext({ createStore: true, autoMount: false })

  const props = {
    id: '123',
    otherProp: 'why not',
  }

  const thirdLogic = kea({
    key: props => props.id,
    path: key => ['autoConnect', 'third', key],
    actions: () => ({
      thirdAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      thirdName: [
        'third',
        {
          [actions.thirdAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const thirdUnmount = thirdLogic(props).mount()

  const secondLogic = kea({
    key: props => props.id,
    path: key => ['autoConnect', 'second', key],
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions, props }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  let listenerRan = false

  const logic = kea({
    key: props => props.id,
    path: key => ['autoConnect', 'first', key],
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions, props }) => ({
      name: [
        'first',
        {
          updateName: (_, { name }) => name,
          [secondLogic(props).actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),

    listeners: () => ({
      updateName: () => {
        expect(Object.keys(getContext().store.getState().autoConnect).sort()).toEqual(['first', 'second'])
        thirdLogic(props).actions.thirdAction('thirdname')
        expect(Object.keys(getContext().store.getState().autoConnect).sort()).toEqual(['first', 'second', 'third'])
        listenerRan = true
      },
    }),
  })

  const unmount = logic(props).mount()

  thirdUnmount()

  expect(logic.values).not.toBeDefined()

  expect(logic(props).values.name).toEqual('first')
  expect(secondLogic(props).values.secondName).toEqual('second')
  expect(() => {
    thirdLogic(props).values.thirdName
  }).toThrow() // eslint-disable-line

  logic(props).actions.updateName('bla')
  expect(thirdLogic(props).values.thirdName).toEqual('thirdname') // eslint-disable-line

  unmount()

  expect(listenerRan).toBe(true)

  expect(() => {
    logic(props).values.name
  }).toThrow() // eslint-disable-line
  expect(() => {
    secondLogic(props).values.secondName
  }).toThrow() // eslint-disable-line
  expect(() => {
    thirdLogic(props).values.thirdName
  }).toThrow() // eslint-disable-line
})

test('other logic is not connected if autoConnect is false', () => {
  resetContext({ createStore: true, autoMount: false, autoConnect: false })

  const thirdLogic = kea({
    actions: () => ({
      thirdAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      thirdName: [
        'third',
        {
          [actions.thirdAction]: (_, { name }) => name,
        },
      ],
    }),
  })

  const secondLogic = kea({
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),

    selectors: ({ selectors }) => ({
      combinedName: [
        () => [selectors.secondName, thirdLogic.selectors.thirdName],
        (secondName, thirdName) => `${secondName}.${thirdName}`,
      ],
    }),
  })

  const logic = kea({
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
          [secondLogic.actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),

    selectors: ({ selectors }) => ({
      combinedName: [
        () => [selectors.name, secondLogic.selectors.combinedName],
        (name, combinedName) => `${name}.${combinedName}`,
      ],
    }),
  })

  const unmount1 = logic.mount()

  expect(() => {
    logic.values.combinedName
  }).toThrow() // eslint-disable-line

  unmount1()
})

test('multiple mounts and unmounts with listener connection', () => {
  resetContext({ createStore: true, autoMount: false })

  let nameFromAction = ''

  const secondLogic = kea({
    path: () => ['mount', 'second'],
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),
    listeners: ({ actions }) => ({
      [actions.secondAction]: ({ name }) => {
        nameFromAction = name
      },
    }),
  })

  const logic = kea({
    path: () => ['mount', 'logic'],
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
        },
      ],
    }),

    listeners: ({ actions }) => ({
      [actions.updateName]: ({ name }) => {
        secondLogic.actions.secondAction('new name')
      },
    }),
  })

  const unmount1 = logic.mount()
  const unmount2 = logic.mount()
  const unmount3 = logic.mount()

  expect(getContext().mount.counter).toEqual({ 'mount.logic': 3 })

  expect(logic.values.name).toEqual('first')
  expect(nameFromAction).toEqual('')

  logic.actions.updateName('new name')
  expect(getContext().mount.counter).toEqual({ 'mount.logic': 3, 'mount.second': 3 })

  unmount3()
  expect(getContext().mount.counter).toEqual({ 'mount.logic': 2, 'mount.second': 2 })

  unmount2()
  expect(getContext().mount.counter).toEqual({ 'mount.logic': 1, 'mount.second': 1 })

  unmount1()
  expect(getContext().mount.counter).toEqual({})
})

test('multiple mounts and unmounts with double connection', () => {
  resetContext({ createStore: true, autoMount: false })

  let nameFromAction = ''

  const thirdLogic = kea({
    path: () => ['mount', 'third'],
    reducers: ({ actions }) => ({
      thirdName: ['third'],
    }),
  })

  const secondLogic = kea({
    connect: [thirdLogic],
    path: () => ['mount', 'second'],
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),
    listeners: ({ actions }) => ({
      [actions.secondAction]: ({ name }) => {
        nameFromAction = name
      },
    }),
  })

  const logic = kea({
    path: () => ['mount', 'logic'],
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
        },
      ],
    }),

    listeners: ({ actions }) => ({
      [actions.updateName]: ({ name }) => {
        secondLogic.actions.secondAction('new name')
      },
    }),
  })

  const unmount1 = logic.mount()
  const unmount2 = logic.mount()
  const unmount3 = logic.mount()

  expect(getContext().mount.counter).toEqual({ 'mount.logic': 3 })

  expect(logic.values.name).toEqual('first')
  expect(nameFromAction).toEqual('')

  logic.actions.updateName('new name')
  expect(getContext().mount.counter).toEqual({ 'mount.logic': 3, 'mount.second': 3, 'mount.third': 3 })

  const unmount4 = logic.mount()
  expect(getContext().mount.counter).toEqual({ 'mount.logic': 4, 'mount.second': 4, 'mount.third': 4 })

  unmount4()
  expect(getContext().mount.counter).toEqual({ 'mount.logic': 3, 'mount.second': 3, 'mount.third': 3 })

  unmount3()
  expect(getContext().mount.counter).toEqual({ 'mount.logic': 2, 'mount.second': 2, 'mount.third': 2 })

  unmount2()
  expect(getContext().mount.counter).toEqual({ 'mount.logic': 1, 'mount.second': 1, 'mount.third': 1 })

  unmount1()
  expect(getContext().mount.counter).toEqual({})
})

test('multiple mounts and unmounts with double connection in actions/values', () => {
  resetContext({ createStore: true, autoMount: false })

  let nameFromAction = ''

  const fourthLogic = kea({
    path: () => ['mount', 'fourth'],
    actions: () => ({
      updateFourth: true,
    }),
    reducers: ({ actions }) => ({
      fourthName: ['fourth'],
    }),
  })

  const thirdLogic = kea({
    path: () => ['mount', 'third'],
    reducers: ({ actions }) => ({
      thirdName: ['third'],
    }),
  })

  const secondLogic = kea({
    connect: {
      values: [thirdLogic, ['thirdName']],
      actions: [fourthLogic, ['updateFourth']],
    },
    path: () => ['mount', 'second'],
    actions: () => ({
      secondAction: name => ({ name }),
    }),
    reducers: ({ actions }) => ({
      secondName: [
        'second',
        {
          [actions.secondAction]: (_, { name }) => name,
        },
      ],
    }),
    listeners: ({ actions }) => ({
      [actions.secondAction]: ({ name }) => {
        nameFromAction = name
      },
    }),
  })

  const logic = kea({
    path: () => ['mount', 'logic'],
    actions: () => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'first',
        {
          [actions.updateName]: (_, { name }) => name,
        },
      ],
    }),

    listeners: ({ actions }) => ({
      [actions.updateName]: ({ name }) => {
        secondLogic.actions.secondAction('new name')
      },
    }),
  })

  const unmount1 = logic.mount()
  const unmount2 = logic.mount()
  const unmount3 = logic.mount()

  expect(getContext().mount.counter).toEqual({ 'mount.logic': 3 })

  expect(logic.values.name).toEqual('first')
  expect(nameFromAction).toEqual('')

  logic.actions.updateName('new name')
  expect(getContext().mount.counter).toEqual({
    'mount.logic': 3,
    'mount.second': 3,
    'mount.third': 3,
    'mount.fourth': 3,
  })

  const unmount4 = logic.mount()
  expect(getContext().mount.counter).toEqual({
    'mount.logic': 4,
    'mount.second': 4,
    'mount.third': 4,
    'mount.fourth': 4,
  })

  unmount4()
  expect(getContext().mount.counter).toEqual({
    'mount.logic': 3,
    'mount.second': 3,
    'mount.third': 3,
    'mount.fourth': 3,
  })

  unmount3()
  expect(getContext().mount.counter).toEqual({
    'mount.logic': 2,
    'mount.second': 2,
    'mount.third': 2,
    'mount.fourth': 2,
  })

  unmount2()
  expect(getContext().mount.counter).toEqual({
    'mount.logic': 1,
    'mount.second': 1,
    'mount.third': 1,
    'mount.fourth': 1,
  })

  unmount1()
  expect(getContext().mount.counter).toEqual({})
})
