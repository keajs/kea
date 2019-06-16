import { runPlugins } from '../plugins'
import { mountPaths, unmountPaths } from './mount'
import { getContext } from '../context'

// builds logic. does not check if it's built or already on the context
export function buildLogic ({ inputs, path, key, props }) {
  const input = inputs[0]
  let logic = createBlankLogic({ key, path, props })

  runPlugins('beforeBuild', logic, input)

  for (const input of inputs) {
    applyInputToLogic(logic, input)
    if (input.extend) {
      for (const input of input.extend) {
        applyInputToLogic(logic, input)
      }    
    }
  }

  runPlugins('afterBuild', logic, input)

  return logic
}

function createBlankLogic ({ key, path, props }) {
  let logic = {
    _isBuiltLogic: true,
    key,
    path,
    pathString: path.join('.'),
    props,
    extend: input => applyInputToLogic(logic, input),
    mount: () => {
      mountPaths(logic)
      return () => unmountPaths(logic)
    }
  }

  const { plugins } = getContext()

  for (const plugin of plugins.activated) {
    if (plugin.defaults) {
      const defaults = typeof plugin.defaults === 'function' ? plugin.defaults() : plugin.defaults
      Object.assign(logic, defaults)
    }
  }

  return logic
}

// Converts `input` into `logic`.
function applyInputToLogic (logic, input) {
  // We will start with an object like this and extend it as we go along.
  // In the end this object will be returned as `const logic = kea(input)`

  // Let's call all plugins that want to hook into this moment.
  runPlugins('beforeLogic', logic, input)

  const { plugins: { buildSteps } } = getContext()

  for (const step of Object.keys(buildSteps)) {
    for (const func of buildSteps[step]) {
      func(logic, input)
    }
  }

  /*
    add a connection to ourselves in the end
    logic.connections = { ...logic.connections, 'scenes.path.to.logic': logic }
  */
  logic.connections[logic.pathString] = logic
  runPlugins('afterLogic', logic, input)

  return logic
}
