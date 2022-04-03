import { Logic, LogicBuilder, PathType, KeyType } from '../types'

export function path<L extends Logic = Logic>(input: PathType | ((key: KeyType) => PathType)): LogicBuilder<L> {
  return (logic) => {
    if (logic.path && !("_keaAutomaticPath" in logic.path)) {
      // Already set a path, ignore every next call.
      return
    }
    if (Object.keys(logic.actions).length > 0) {
      throw new Error(
        `[KEA] Can not add path to logic "${logic.pathString}" after adding actions: ${Object.keys(logic.actions).join(
          ', ',
        )}`,
      )
    }
    if (typeof input === 'function') {
      logic.path = input(logic.key!)
    } else {
      logic.path = typeof logic.key !== 'undefined' ? [...input, logic.key] : input
    }
    logic.pathString = logic.path.join('.')
  }
}
