export function createStructure (reducer, value, type, options) {
  const mapping = {
    type,
    value,
    reducer
  }

  if (options) {
    Object.assign(mapping, options)
  }

  return mapping
}
