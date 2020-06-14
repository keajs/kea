/*
  Convert any requested constants to objects that can be destructured

  input.constants = ['SOMETHING', 'CONSTANT_NAME']

  ... converts to:

  logic.constants = { SOMETHING: 'SOMETHING', CONSTANT_NAME: 'CONSTANT_NAME' }
*/
export function createConstants (logic, input) {
  if (!input.constants) {
    return
  }

  const constants = convertConstants(typeof input.constants === 'function' ? input.constants(logic) : input.constants)
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
