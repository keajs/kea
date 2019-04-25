export function createConstants (logic, input) {
  if (!input.constants) {
    return
  }

  const constants = convertConstants(input.constants(logic))
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
