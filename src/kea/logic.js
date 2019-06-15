import { getContext } from '../context'

import { getPathForInput } from './path'
import { buildLogic } from './build'

export function getBuiltLogic ({ input, props, inputExtensions }) {
  const key = props && input.key ? input.key(props) : undefined

  if (!key && input.key) {
    throw new Error('[KEA] Must have key to build logic')
  }

  // get a path for the input, even if no path was manually specified in the input
  const path = getPathForInput(input, props)
  const pathString = path.join('.')

  const { build: { cache } } = getContext()

  if (!cache[pathString]) {
    cache[pathString] = buildLogic({ input, path, key, props, inputExtensions })
  } else {
    addPropsToLogic(cache[pathString], props)
  }

  return cache[pathString]
}

export function addPropsToLogic (logic, props) {
  logic.props = props
}
