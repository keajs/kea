import { createConstants } from '../core/steps/constants'

import { getCache } from '../cache'
import { runPlugins } from '../plugins'

export function convertInputToLogic ({ input, key: inputKey, props, plugins }) {
  const key = inputKey || (props && input.key ? input.key(props) : null)

  if (!key && input.key) {
    throw new Error('Must have key')
  }

  const path = getPathForInput(input, key)
  const pathString = path.join('.')

  const { logicCache } = getCache()

  if (!logicCache[pathString]) {
    let logic = createBlankLogic({ key, path, plugins, props })
    applyInputToLogic(logic, input)

    input.merge && input.merge.forEach(merge => applyInputToLogic(logic, merge))

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
  runPlugins(logic.plugins, 'afterConstants', logic, input)

  return logic
}

function createBlankLogic ({ key, path, plugins, props }) {
  let logic = {
    key,
    path,
    plugins,
    props,
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

  const { inputPathCreators } = getCache()

  let pathCreator = inputPathCreators.get(input)

  if (pathCreator) {
    return pathCreator(key)
  }

  const count = (++getCache().globalInputCounter).toString()

  if (key) {
    pathCreator = (key) => ['kea', 'inline', count, key]
  } else {
    pathCreator = () => ['kea', 'inline', count]
  }

  inputPathCreators.set(input, pathCreator)

  return pathCreator(key)
}
