import { createConnect, addConnection } from './connect'
import { createConstants } from './constants'
import { createActions } from './actions'
import { createReducers } from './reducers'
import { createSelectors, createReducerSelectors } from './selectors'

import { addReducer } from '../store/reducer'

let inputPathCreators = new WeakMap()
let globalInputCounter = 0

let logicCache = {}

export function clearLogicCache () {
  inputPathCreators = new WeakMap()
  globalInputCounter = 0

  logicCache = {}
}

export function convertInputToLogic ({ input, key: inputKey, props: inputProps, plugins }) {
  const key = inputKey || (inputProps && input.key ? input.key(inputProps) : null)

  if (!key && input.key) {
    throw new Error('Must have key')
  }

  const path = getPathForInput(input, key)
  const pathString = path.join('.')

  if (!logicCache[pathString]) {
    const output = convertInputWithPath(input, key, path, plugins)

    logicCache[pathString] = output

    if (output.reducer) {
      addReducer(output.path, output.reducer)
    }
  }

  return logicCache[pathString]
}

export function convertPartialDynamicInput ({ input, plugins }) {
  let output = {
    constants: {}
  }

  createConstants(input, output)
  plugins.forEach(p => p.afterCreateConstants && p.afterCreateConstants(input, output))

  return output
}

function convertInputWithPath (input, key, path, plugins) {
  let output = {
    key,
    path,
    connections: {},
    constants: {},
    actions: {},
    defaults: {},
    reducers: {},
    reducerOptions: {},
    selectors: {},
    propTypes: {},
    reducer: undefined,
    plugins: plugins
  }

  plugins.forEach(p => p.beforeCreate && p.beforeCreate(input, output))

  createConnect(input, output)
  plugins.forEach(p => p.afterCreateConnect && p.afterCreateConnect(input, output, addConnection))

  createConstants(input, output)
  plugins.forEach(p => p.afterCreateConstants && p.afterCreateConstants(input, output))

  createActions(input, output)
  plugins.forEach(p => p.afterCreateActions && p.afterCreateActions(input, output))

  createReducers(input, output)
  plugins.forEach(p => p.afterCreateReducers && p.afterCreateReducers(input, output))

  createReducerSelectors(input, output)
  plugins.forEach(p => p.afterCreateReducerSelectors && p.afterCreateReducerSelectors(input, output))

  createSelectors(input, output)
  plugins.forEach(p => p.afterCreateSelectors && p.afterCreateSelectors(input, output))

  output.connections[path.join('.')] = output

  plugins.forEach(p => p.afterCreate && p.afterCreate(input, output))

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

  const count = (++globalInputCounter).toString()

  if (key) {
    pathCreator = (key) => ['kea', 'inline', count, key]
  } else {
    pathCreator = () => ['kea', 'inline', count]
  }

  inputPathCreators.set(input, pathCreator)

  return pathCreator(key)
}
