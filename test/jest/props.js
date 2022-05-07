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

    test('props merge when building', () => {
      const logic = kea({ key: (props) => props.id })

      const builtLogic1 = logic({ id: 123, misc: 'bla' })
      expect(builtLogic1.props).toEqual({ id: 123, misc: 'bla' })

      const builtLogic2 = logic({ id: 123, other: true })
      expect(builtLogic2.props).toEqual({ id: 123, misc: 'bla', other: true })
      expect(builtLogic1.props).toEqual(builtLogic2.props)

      const builtLogic3 = logic({ id: 123 })
      expect(builtLogic3.props).toEqual({ id: 123, misc: 'bla', other: true })
      expect(builtLogic1.props).toEqual(builtLogic2.props)
      expect(builtLogic1.props).toEqual(builtLogic3.props)
    })

    test('props do not change if shallow equal', () => {
      const logic = kea({ key: (props) => props.id })

      const props1 = { id: 123, misc: 'bla' }
      const props2 = { id: 123, misc: 'bla' }
      expect(props1 === props2).toEqual(false)

      const builtLogic1 = logic(props1)
      expect(builtLogic1.props === props1).toEqual(true)

      const builtLogic2 = logic(props2)
      expect(builtLogic1.props === props1).toEqual(true)
      expect(builtLogic2.props === props1).toEqual(true)
    })
  })
})
