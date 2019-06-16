import { runPlugins } from '../plugins'
import { mountPaths, unmountPaths } from './mount'
import { getContext } from '../context'

// builds logic. does not check if it's built or already on the context
export function buildLogic ({ inputs, path, key, props }) {
  let logic = createBlankLogic({ key, path, props })
  setLogicDefaults(logic)

  // TODO: add all inputs to events or fix some other way
  runPlugins('beforeBuild', logic, inputs)

  for (const input of inputs) {
    applyInputToLogic(logic, input)
    if (input.extend) {
      for (const input of input.extend) {
        applyInputToLogic(logic, input)
      }    
    }
  }

  /*
    add a connection to ourselves in the end
    logic.connections = { ...logic.connections, 'scenes.path.to.logic': logic }
  */ 
  logic.connections[logic.pathString] = logic

  runPlugins('afterBuild', logic, inputs)
 
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

  return logic
}

function setLogicDefaults (logic) {
  const { plugins } = getContext()

  for (const plugin of plugins.activated) {
    if (plugin.defaults) {
      const defaults = typeof plugin.defaults === 'function' ? plugin.defaults() : plugin.defaults
      Object.assign(logic, defaults)
    }
  }
}

// Converts `input` into `logic` by running all build steps in succession
function applyInputToLogic (logic, input) {
  runPlugins('beforeLogic', logic, input)

  const { plugins: { buildSteps } } = getContext()

  for (const step of Object.keys(buildSteps)) {
    for (const func of buildSteps[step]) {
      func(logic, input)
    }
  }

  runPlugins('afterLogic', logic, input)

  return logic
}
