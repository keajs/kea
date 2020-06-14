/* global test, expect, beforeEach */
import { kea, resetContext } from '../index'

beforeEach(() => {
  resetContext()
})

test('it works without () => ({}) and just with {}', () => {
  let iveBeen

  const logic = kea({
    path: ['something', 'album'],
    constants: ['SOMEONE', 'USING', 'THESE?'],
    actions: {
      setFlunk: flunk => ({ flunk })
    },
    reducers: {
      flunk: {
        setFlunk: (_, { flunk }) => flunk
      }
    },
    defaults: {
      flunk: 'whatitmeans'
    },
    selectors: {
      someOtherSelector: [() => [], () => 'downdowndown']
    },
    listeners: {
      setFlunk: () => {
        iveBeen = logic.values.someOtherSelector
      }
    },
    events: {
      afterMount () {
        iveBeen = 'up'
      }
    }
  })

  const umount = logic.mount()

  expect(iveBeen).toBe('up')

  expect(Object.keys(logic.constants)).toEqual(['SOMEONE', 'USING', 'THESE?'])
  expect(Object.keys(logic.actions)).toEqual(['setFlunk'])
  expect(Object.keys(logic.reducers)).toEqual(['flunk'])
  expect(Object.keys(logic.selectors)).toEqual(['flunk', 'someOtherSelector'])

  expect(logic.values.flunk).toBe('whatitmeans')
  logic.actions.setFlunk('donotknow')
  expect(logic.values.flunk).toBe('donotknow')
  expect(iveBeen).toBe('downdowndown')

  umount()
})
