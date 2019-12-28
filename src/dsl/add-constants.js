import { getContext } from '../index'

export function addConstants (constantsToAdd) {
  const logic = getContext().build.building

  const constants = convertConstants(constantsToAdd)
  Object.assign(logic.constants, constants)
}

// convert ['A', 'B'] ==> { 'A': 'A', 'B': 'B' }
export default function convertConstants (c) {
  if (Array.isArray(c)) {
    let a = {}
    for (let i = 0; i < c.length; i++) {
      a[c[i]] = c[i]
    }
    return a
  }
  return c
}
