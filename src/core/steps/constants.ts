/*
  Convert any requested constants to objects that can be destructured

  input.constants = ['SOMETHING', 'CONSTANT_NAME']

  ... converts to:

  logic.constants = { SOMETHING: 'SOMETHING', CONSTANT_NAME: 'CONSTANT_NAME' }
*/
import { Logic, LogicInput } from '../../types'

export function createConstants(logic: Logic, input: LogicInput): void {
  if (!input.constants) {
    return
  }

  const constants = convertConstants(typeof input.constants === 'function' ? input.constants(logic) : input.constants)
  Object.assign(logic.constants, constants)
}

// convert ['A', 'B'] ==> { 'A': 'A', 'B': 'B' }
export default function convertConstants(constants: string[]): Record<string, string> {
  if (Array.isArray(constants)) {
    const response: Record<string, string> = {}
    for (const value of constants) {
      response[value] = value
    }
    return response
  }
  return constants
}
