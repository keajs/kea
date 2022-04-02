import { KeyType, Logic, LogicBuilder } from '../types'

export function key<L extends Logic = Logic>(input: KeyType | ((props: L['props']) => KeyType)): LogicBuilder<L> {
  return (logic) => {
    const newKey = typeof input === 'function' ? input(logic.props) : input
    if (typeof logic.key !== 'undefined') {
      throw new Error(
        `[KEA] Already defined key for logic "${logic.pathString}". Old key: "${logic.key}", new key: "${newKey}"`,
      )
    }
    if (typeof newKey === 'undefined') {
      throw new Error(`[KEA] Undefined key for logic "${logic.pathString}"`)
    }
    if (Object.keys(logic.actions).length > 0) {
      throw new Error(
        `[KEA] Can not add key to logic "${logic.pathString}" after adding actions: ${Object.keys(logic.actions).join(
          ', ',
        )}`,
      )
    }
    logic.key = newKey
    logic.path = [...logic.path, logic.key]
    logic.pathString = logic.path.join('.')
  }
}
