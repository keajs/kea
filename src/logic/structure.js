export function createMapping (reducer, value, type, options) {
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
