export function createMapping (reducer, value, type, options) {
  console.warn(`[KEA-LOGIC] createMapping is deprecated. Please use the new compact Array format. See here for an example: https://gist.github.com/mariusandra/1b8eeb3f2f4e542188b915e27133c858`)

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

export function convertStructureArrays (structure) {
  if (!structure) {
    return structure
  }

  const keys = Object.keys(structure)
  for (let i = 0; i < keys.length; i++) {
    const s = structure[keys[i]]
    if (Array.isArray(s)) {
      // s = [ value, type, options, reducer ]
      structure[keys[i]] = Object.assign({
        value: s[0],
        type: s[1],
        reducer: s[3] || s[2]
      }, s[3] ? s[2] : {})
    }
  }

  return structure
}
