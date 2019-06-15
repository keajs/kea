import { getContext } from '../context'

export function getPathForInput (input, key) {
  if (input.path) {
    return input.path(key)
  }

  const { input: { inlinePathCreators } } = getContext()

  let pathCreator = inlinePathCreators.get(input)

  if (pathCreator) {
    return pathCreator(key)
  }

  const count = (++getContext().input.inlinePathCounter).toString()

  if (input.key) {
    pathCreator = (key) => ['kea', 'inline', count, key]
  } else {
    pathCreator = () => ['kea', 'inline', count]
  }

  inlinePathCreators.set(input, pathCreator)

  return pathCreator(key)
}

export function getPathStringForInput (input, props = undefined) {
  const key = props && input.key ? input.key(props) : undefined

  return getPathForInput(input, key).join('.')
}
