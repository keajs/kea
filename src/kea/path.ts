import { getContext } from '../context'
import { LogicInput, PathCreator, PathType, Props } from '../types'

export function getPathForInput(input: LogicInput, props?: Props): PathType {
  const key = input.key ? input.key(props || {}) : undefined

  if (input.path) {
    return typeof input.path === 'function' ? input.path(key) : input.path
  }

  const {
    input: { logicPathCreators },
    options: { defaultPath },
  } = getContext()

  let pathCreator = logicPathCreators.get(input)

  if (pathCreator) {
    return pathCreator(key)
  }

  const count = (++getContext().input.logicPathCounter).toString()

  if (input.key) {
    pathCreator = (key: string) => [...defaultPath, count, key]
  } else {
    pathCreator = () => [...defaultPath, count]
  }

  logicPathCreators.set(input, pathCreator)

  return pathCreator(key)
}

export function getPathStringForInput(input: LogicInput, props: Props): string {
  return getPathForInput(input, props).join('.')
}
