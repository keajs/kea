import { createConnect } from './connect'
import { createConstants } from './constants'
import { createActions } from './actions'
import { createReducers } from './reducers'
import { createSelectors, createReducerSelectors } from './selectors'

import { addReducer } from '../store'

let inputPathCreators = new WeakMap()
let globalInputCounter = 0

let logicCache = {}

export function clearLogicCache () {
  inputPathCreators = new WeakMap()
  globalInputCounter = 0

  logicCache = {}
}

export function convertInputToLogic ({ input, key: inputKey, props: inputProps }) {
  const key = inputKey || (inputProps && input.key ? input.key(inputProps) : null)

  if (!key && input.key) {
    throw new Error('Must have key')
  }

  const path = getPathForInput(input, key)
  const pathString = path.join(',')

  if (!logicCache[pathString]) {
    const output = convertInputWithPath(input, key, path)

    logicCache[pathString] = output

    if (output.path) {
      addReducer(output.path, output.reducer)
    }
  }

  return logicCache[pathString]
}

export function convertPartialDynamicInput (input) {
  let output = {
    constants: {}
  }

  createConstants(input, output)

  return output
}

function convertInputWithPath (input, key, path) {
  let output = {
    key,
    path,
    constants: {},
    actions: {},
    defaults: {},
    reducers: {},
    selectors: {},
    propTypes: {},
    reducer: () => ({})
  }

  // no path if only connecting. this avoids polluting with empty reducers
  if (Object.keys(input).length === 1 && input.connect) {
    output.path = undefined
  }

  createConnect(input, output)
  createConstants(input, output)
  createActions(input, output)
  createReducers(input, output)
  createReducerSelectors(input, output)
  createSelectors(input, output)

  return output
}

function getPathForInput (input, key) {
  if (input.path) {
    return input.path(key)
  }

  let pathCreator = inputPathCreators.get(input)

  if (pathCreator) {
    return pathCreator(key)
  }

  if (key) {
    pathCreator = (key) => ['kea', 'inline', (++globalInputCounter).toString(), key]
  } else {
    pathCreator = () => ['kea', 'inline', (++globalInputCounter).toString()]
  }

  inputPathCreators.set(input, pathCreator)

  return pathCreator(key)
}
