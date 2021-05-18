import { runPlugins } from '../plugins'
import { getContext } from '../context'

import { mountLogic, unmountLogic } from './mount'
import { getPathForInput } from './path'
import { addConnection } from '../core/shared/connect'

import { Logic, LogicWrapper, Props, LogicInput, BuiltLogicAdditions, BuiltLogic, PathType } from '../types'

// Converts `input` into `logic` by running all build steps in succession
function applyInputToLogic(logic: BuiltLogic, input: LogicInput) {
  runPlugins('beforeLogic', logic, input)

  const {
    plugins: { buildOrder, buildSteps },
  } = getContext()

  if (input.inherit) {
    for (const inheritLogic of input.inherit) {
      for (const inheritInput of inheritLogic.inputs) {
        applyInputToLogic(logic, inheritInput)
      }
    }
  }

  for (const step of buildOrder) {
    for (const func of buildSteps[step]) {
      func(logic, input)
    }
  }

  if (input.extend) {
    for (const innerInput of input.extend) {
      applyInputToLogic(logic, innerInput)
    }
  }

  runPlugins('afterLogic', logic, input)

  return logic
}

function createBlankLogic({
  key,
  path,
  props,
  wrapper,
}: {
  key: string | undefined
  path: PathType
  props: Props
  wrapper: LogicWrapper
}) {
  const logic = ({
    _isKeaBuild: true,
    key,
    path,
    pathString: path.join('.'),
    props,
    wrapper,
    extend: (input: LogicInput) => applyInputToLogic(logic, input),
    mount: (callback: (logic: Logic) => any) => {
      mountLogic(logic)
      if (callback) {
        const response = callback(logic)

        if (response && response.then && typeof response.then === 'function') {
          return response.then((value: any) => {
            unmountLogic(logic)
            return value
          })
        }

        unmountLogic(logic)
        return response
      }
      return () => unmountLogic(logic)
    },
  } as any) as BuiltLogic

  return logic
}

function setLogicDefaults(logic: Logic) {
  const { plugins } = getContext()

  for (const plugin of plugins.activated) {
    if (plugin.defaults) {
      const defaults = typeof plugin.defaults === 'function' ? plugin.defaults() : plugin.defaults
      Object.assign(logic, defaults)
    }
  }
}

// builds logic. does not check if it's built or already on the context
function buildLogic({
  inputs,
  path,
  key,
  props,
  wrapper,
}: {
  inputs: LogicInput[]
  path: PathType
  key: string | undefined
  props: Props
  wrapper: LogicWrapper
}) {
  const logic = createBlankLogic({ key, path, props, wrapper })
  setLogicDefaults(logic)

  const {
    build: { heap },
  } = getContext()

  heap.push(logic)

  runPlugins('beforeBuild', logic, inputs)

  for (const input of inputs) {
    applyInputToLogic(logic, input)
  }

  /*
    add a connection to ourselves in the end
    logic.connections = { ...logic.connections, 'scenes.path.to.logic': logic }
  */
  logic.connections[logic.pathString] = logic

  runPlugins('afterBuild', logic, inputs)

  heap.pop()

  return logic
}

export function getBuiltLogic(
  inputs: LogicInput[],
  props: Props | undefined,
  wrapper: LogicWrapper,
  autoConnectInListener = true,
): BuiltLogic {
  const input = inputs[0]
  const key = input.key ? input.key(props || {}) : undefined

  if (input.key && typeof key === 'undefined') {
    const path = typeof input.path === 'function' ? input.path(key) : input.path
    const pathString = Array.isArray(path) ? ` ${path.join('.')}` : ''
    throw new Error(`[KEA] Must have key to build logic${pathString}, got props: ${JSON.stringify(props)}`)
  }

  // get a path for the input, even if no path was manually specified in the input
  const path = getPathForInput(input, props)
  const pathString = path.join('.')

  const {
    build: { heap: buildHeap, cache: buildCache },
    run: { heap: runHeap },
    options: { autoConnect: globalAutoConnect },
    mount: { counter: mountCounter },
  } = getContext()

  if (!buildCache[pathString]) {
    buildCache[pathString] = buildLogic({ inputs, path, key, props: props || {}, wrapper })
  } else if (props) {
    buildCache[pathString].props = props
  }

  // autoConnect must be enabled globally
  if (globalAutoConnect) {
    // if we were building something when this got triggered, add this as a dependency for the previous logic
    // always connect these, even if autoConnectInListener is false
    if (buildHeap.length > 0) {
      if (!buildHeap[buildHeap.length - 1].connections[pathString]) {
        addConnection(buildHeap[buildHeap.length - 1], buildCache[pathString])
      }

      // if we were running a listener and built this logic, mount it directly
      // ... except if autoConnectInListener is false
    } else if (autoConnectInListener && runHeap.length > 0) {
      const heapElement = runHeap[runHeap.length - 1]
      const { logic, type } = heapElement
      if (type === 'listener' && !logic.connections[pathString]) {
        addConnection(logic, buildCache[pathString])
        mountLogic(buildCache[pathString], mountCounter[logic.pathString]) // will be unmounted via the connection
      }
    }
  }

  return buildCache[pathString]
}
