import { getContext } from '../context'
import { LogicInput, PathCreator, PathType, Props } from '../types'

export function getPathForInput(input: LogicInput, props: Props): PathType {
  const key = props && input.key ? input.key(props) : undefined

  if (input.path) {
    return typeof input.path === 'function' ? input.path(key) : input.path
  }

  const {
    input: { inlinePathCreators },
  } = getContext()

  let pathCreator = inlinePathCreators.get(input)

  if (pathCreator) {
    return pathCreator(key)
  }

  const count = (++getContext().input.inlinePathCounter).toString()

  if (input.key) {
    pathCreator = ((key: string) => ['kea', 'inline', count, key]) as PathCreator
  } else {
    pathCreator = () => ['kea', 'inline', count]
  }

  inlinePathCreators.set(input, pathCreator)

  return pathCreator(key)
}

export function getPathStringForInput(input: LogicInput, props: Props): string {
  return getPathForInput(input, props).join('.')
}
