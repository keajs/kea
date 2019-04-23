import { createConnect, addConnection } from './connect'
import { createConstants } from './constants'
import { createActions } from './actions'
import { createReducerInputs, createReducers } from './reducers'
import { createSelectors, createReducerSelectors } from './selectors'

import { attachReducer } from '../store/reducer'

let inputPathCreators = new WeakMap()
let globalInputCounter = 0

let logicCache = {}

export function clearLogicCache () {
  inputPathCreators = new WeakMap()
  globalInputCounter = 0

  logicCache = {}
}

export function convertInputToLogic ({ input, key: inputKey, props, plugins, connectToStore = true }) {
  const key = inputKey || (props && input.key ? input.key(props) : null)

  if (!key && input.key) {
    throw new Error('Must have key')
  }

  const path = getPathForInput(input, key)
  const pathString = path.join('.')

  if (!logicCache[pathString]) {
    const output = convertInputWithPath({ input, key, path, plugins, props })

    logicCache[pathString] = output

    if (connectToStore && output.reducer) {
      attachReducer(output.path, output.reducer)
    }
  } else {
    enhanceExistingLogic(logicCache[pathString], { props })
  }

  return logicCache[pathString]
}

function enhanceExistingLogic (output, { props }) {
  output.props = props
}

export function convertPartialDynamicInput ({ input, plugins }) {
  let output = {
    constants: {}
  }

  createConstants(input, output)
  plugins.forEach(p => p.afterConstants && p.afterConstants(input, output))

  return output
}

function convertInputWithPath ({ input, key, path, plugins, props }) {
  let output = {
    key,
    path,
    plugins,
    props,
    connections: {},
    constants: {},
    actions: {},
    defaults: {},
    reducerInputs: {},
    reducers: {},
    selectors: {},
    propTypes: {},
    reducer: undefined
  }

  plugins.forEach(p => p.beforeCreate && p.beforeCreate(input, output))

  createConnect(input, output)
  plugins.forEach(p => p.afterConnect && p.afterConnect(input, output, addConnection))

  createConstants(input, output)
  plugins.forEach(p => p.afterConstants && p.afterConstants(input, output))

  createActions(input, output)
  plugins.forEach(p => p.afterActions && p.afterActions(input, output))

  createReducerInputs(input, output)
  plugins.forEach(p => p.afterReducerInputs && p.afterReducerInputs(input, output))

  createReducers(input, output)
  plugins.forEach(p => p.afterReducers && p.afterReducers(input, output))

  createReducerSelectors(input, output)
  plugins.forEach(p => p.afterReducerSelectors && p.afterReducerSelectors(input, output))

  createSelectors(input, output)
  plugins.forEach(p => p.afterSelectors && p.afterSelectors(input, output))

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
