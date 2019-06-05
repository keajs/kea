import { createConstants } from '../core/steps/constants'

import { getContext } from '../context'
import { runPlugins, getLocalPlugins } from '../plugins'

export function buildLogic ({ input, key: inputKey, props, extendedInputs }) {
  const key = inputKey || (props && input.key ? input.key(props) : null)

  if (!key && input.key) {
    throw new Error('Must have key')
  }

  const path = getPathForInput(input, key)
  const pathString = path.join('.')

  const { logicCache } = getContext()

  if (!logicCache[pathString]) {
    const plugins = getLocalPlugins(input)
    let logic = createBlankLogic({ key, path, plugins, props })

    runPlugins(logic.plugins, 'beforeBuild', logic, input)

    applyInputToLogic(logic, input)

    const extend = (input.extend || []).concat(logic._extendWith || []).concat(extendedInputs || [])
    logic._extendWith = []

    extend.forEach(extendedInput => applyInputToLogic(logic, extendedInput))

    runPlugins(logic.plugins, 'afterBuild', logic, input)

    logic._extendWith.forEach(extendedInput => applyInputToLogic(logic, extendedInput))

    logicCache[pathString] = logic
  } else {
    enhanceExistingLogic(logicCache[pathString], { props })
  }

  return logicCache[pathString]
}

export function convertPartialDynamicInput ({ input, plugins }) {
  let logic = {
    plugins: plugins,
    constants: {}
  }

  createConstants(logic, input)

  return logic
}

function createBlankLogic ({ key, path, plugins, props }) {
  let logic = {
    key,
    path,
    plugins,
    props,
    extend: input => logic._extendWith.push(input),
    _extendWith: [],
    mounted: false
  }

  plugins.activated.forEach(p => p.defaults && Object.assign(logic, p.defaults()))

  return logic
}

function enhanceExistingLogic (logic, { props }) {
  logic.props = props
}

// Converts `input` into `logic`.
function applyInputToLogic (logic, input) {
  // We will start with an object like this and extend it as we go along.
  // In the end this object will be returned as `const logic = kea(input)`
  // let logic = createBlankLogic({ key, path, plugins, props })

  // Let's call all plugins that want to hook into this moment.
  runPlugins(logic.plugins, 'beforeLogic', logic, input)

  const steps = logic.plugins.logicSteps

  for (const step of Object.keys(steps)) {
    for (const func of steps[step]) {
      func(logic, input)
    }
  }

  /*
    add a connection to ourselves in the end
    logic.connections = { ...logic.connections, 'scenes.path.to.logic': logic }
  */
  logic.connections[logic.path.join('.')] = logic
  runPlugins(logic.plugins, 'afterLogic', logic, input)

  return logic
}

function getPathForInput (input, key) {
  if (input.path) {
    return input.path(key)
  }

  const { pathWeakMap } = getContext()

  let pathCreator = pathWeakMap.get(input)

  if (pathCreator) {
    return pathCreator(key)
  }

  const count = (++getContext().inlinePathCounter).toString()

  if (input.key) {
    pathCreator = (key) => ['kea', 'inline', count, key]
  } else {
    pathCreator = () => ['kea', 'inline', count]
  }

  pathWeakMap.set(input, pathCreator)

  return pathCreator(key)
}

export function getIdForInput (input) {
  const { idWeakMap } = getContext()

  let id = idWeakMap.get(input)

  if (!id) {
    id = getPathForInput(input, '*').join('.')
    idWeakMap.set(input, id)
  }

  return id
}
