import { getContext } from '../context'

import { getPathForInput } from './path'
import { buildLogic } from './build'

export function getBuiltLogic ({ input, key: buildKey, props, extendedInputs }) {
  // if key provided, use it, otherwise get from props if needed
  const key = buildKey || (props && input.key ? input.key(props) : undefined)

  if (!key && input.key) {
    throw new Error('[KEA] Must have key to build logic')
  }

  // get a path for the input, even if no path was manually requested
  const path = getPathForInput(input, key)
  const pathString = path.join('.')

  const { build: { cache } } = getContext()

  if (!cache[pathString]) {
    cache[pathString] = buildLogic({ input, path, key, props, extendedInputs })
  } else {
    addPropsToLogic(cache[pathString], props)
  }

  return cache[pathString]
}

export function addPropsToLogic (logic, props) {
  logic.props = props
}
