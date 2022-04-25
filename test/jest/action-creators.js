import { kea, resetContext, createActionCreator } from '../../src'

describe('action creators', () => {
  beforeEach(() => {
    resetContext()
  })

  test('action creators work the right way', () => {
    const logic = kea({
      path: () => ['scenes', 'homepage', 'index'],
      actions: () => ({
        updateName: (name) => ({ name }),
        actionWithBool: true,
        actionWithInteger: 12,
        actionWithNull: null,
        manualAction: createActionCreator('custom_type', (a) => a),
      }),
    })

    logic.mount()

    expect(logic.path).toEqual(['scenes', 'homepage', 'index'])
    expect(Object.keys(logic.actions).sort()).toEqual([
      'actionWithBool',
      'actionWithInteger',
      'actionWithNull',
      'manualAction',
      'updateName',
    ])

    const { actionWithBool, actionWithInteger, actionWithNull, manualAction, updateName } = logic.actionCreators

    expect(typeof updateName).toBe('function')
    expect(updateName.toString()).toBe('update name (scenes.homepage.index)')
    expect(updateName('newname')).toEqual({ payload: { name: 'newname' }, type: updateName.toString() })

    expect(typeof actionWithBool).toBe('function')
    expect(actionWithBool.toString()).toBe('action with bool (scenes.homepage.index)')
    expect(actionWithBool()).toEqual({ payload: { value: true }, type: actionWithBool.toString() })

    expect(typeof actionWithInteger).toBe('function')
    expect(actionWithInteger.toString()).toBe('action with integer (scenes.homepage.index)')
    expect(actionWithInteger()).toEqual({ payload: { value: 12 }, type: actionWithInteger.toString() })

    expect(typeof actionWithNull).toBe('function')
    expect(actionWithNull.toString()).toBe('action with null (scenes.homepage.index)')
    expect(actionWithNull()).toEqual({ payload: { value: null }, type: actionWithNull.toString() })

    expect(typeof manualAction).toBe('function')
    expect(manualAction.toString()).toBe('custom_type')
    expect(manualAction({ key: 'newname' })).toEqual({ payload: { key: 'newname' }, type: manualAction.toString() })
  })
})
