import { getContext } from '../context'

import { getPathForInput } from './path'
import { buildLogic } from './build'

export function getBuiltLogic (inputs, props) {
  const input = inputs[0]
  const key = props && input.key ? input.key(props) : undefined

  if (input.key && typeof key === 'undefined') {
    throw new Error('[KEA] Must have key to build logic')
  }

  // get a path for the input, even if no path was manually specified in the input
  const path = getPathForInput(input, props)
  const pathString = path.join('.')

  const { build: { cache } } = getContext()

  if (!cache[pathString]) {
    cache[pathString] = buildLogic({ inputs, path, key, props })
  } else {
    cache[pathString].props = props
  }

  return cache[pathString]
}
