import { runPlugins, getLocalPlugins } from '../plugins'

// builds logic. does not check if it's built or already on the context
export function buildLogic ({ input, path, key, props, extendedInputs }) {
  const plugins = getLocalPlugins(input)
  let logic = createBlankLogic({ key, path, plugins, props })

  runPlugins(logic.plugins, 'beforeBuild', logic, input)

  applyInputToLogic(logic, input)

  const extend = (input.extend || []).concat(extendedInputs || [])
  extend.forEach(extendedInput => applyInputToLogic(logic, extendedInput))

  runPlugins(logic.plugins, 'afterBuild', logic, input)

  return logic
}

function createBlankLogic ({ key, path, plugins, props }) {
  let logic = {
    _isBuiltLogic: true,
    key,
    path,
    pathString: path.join('.'),
    plugins,
    props,
    extend: input => applyInputToLogic(logic, input)
  }

  plugins.activated.forEach(p => p.defaults && Object.assign(logic, p.defaults()))

  return logic
}

// Converts `input` into `logic`.
function applyInputToLogic (logic, input) {
  // We will start with an object like this and extend it as we go along.
  // In the end this object will be returned as `const logic = kea(input)`

  // Let's call all plugins that want to hook into this moment.
  runPlugins(logic.plugins, 'beforeLogic', logic, input)

  const steps = logic.plugins.buildSteps

  for (const step of Object.keys(steps)) {
    for (const func of steps[step]) {
      func(logic, input)
    }
  }

  /*
    add a connection to ourselves in the end
    logic.connections = { ...logic.connections, 'scenes.path.to.logic': logic }
  */
  logic.connections[logic.pathString] = logic
  runPlugins(logic.plugins, 'afterLogic', logic, input)

  return logic
}
