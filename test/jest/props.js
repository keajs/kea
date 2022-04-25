import { kea, resetContext } from '../../src'

describe('props', () => {
  beforeEach(() => {
    resetContext()
  })

  describe('props', () => {
    test('always has some props object', () => {
      let listenerRan = false

      const firstLogic = kea({
        actions: () => ({
          updateName: (name) => ({ name }),
        }),
        listeners: ({ actions, props }) => ({
          [actions.updateName]: () => {
            expect(props).toEqual({})
            listenerRan = true
          },
        }),
      })

      firstLogic.mount()
      firstLogic.actions.updateName('name')

      expect(listenerRan).toBe(true)
    })

    test('always has some props object, part 2', () => {
      let listenerRan = false

      const firstLogic = kea({
        actions: () => ({
          updateName: (name) => ({ name }),
        }),
        listeners: ({ actions, props }) => ({
          [actions.updateName]: () => {
            expect(props).toEqual({})
            listenerRan = true
          },
        }),
      })

      firstLogic().mount()
      firstLogic.actions.updateName('name')

      expect(listenerRan).toBe(true)
    })

    test('props update when building', () => {
      const logic = kea({})
      logic.build({ id: 123, key: 'bla' }).mount()
      expect(logic.props.key).toEqual('bla')

      logic.build({ id: 123, key: 'bla2' })
      expect(logic.props.key).toEqual('bla2')
    })
  })
})
