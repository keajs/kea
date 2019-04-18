export function createConstants (input, output) {
  if (!input.constants) {
    return
  }

  const constants = convertConstants(input.constants(output))
  Object.assign(output.constants, constants)
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
