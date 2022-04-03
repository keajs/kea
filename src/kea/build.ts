import { runPlugins } from './plugins'
import { getContext } from './context'

import { mountLogic, unmountLogic } from './mount'

import { Logic, LogicWrapper, Props, LogicInput, BuiltLogic, LogicBuilder, WrapperContext } from '../types'
import { addConnection } from '../core/connect'

// Converts `input` into `logic` by running all build steps in succession
function applyInputToLogic(logic: BuiltLogic, input: LogicInput | LogicBuilder) {
  runPlugins('beforeLogic', logic, input)

  // Logic builder
  if (typeof input === 'function') {
    input(logic)
  } else {
    // Legacy kea({}) object style
    if (input.inherit) {
      for (const inheritLogic of input.inherit) {
        for (const inheritInput of inheritLogic.inputs) {
          applyInputToLogic(logic, inheritInput)
        }
      }
    }
    runPlugins('legacyBuild', logic, input)
    if (input.extend) {
      for (const innerInput of input.extend) {
        applyInputToLogic(logic, innerInput)
      }
    }
  }

  runPlugins('afterLogic', logic, input)

  return logic
}

export function getBuiltLogic<L extends Logic = Logic>(
  wrapper: LogicWrapper<L>,
  props: L['props'] | undefined,
): BuiltLogic<L> {
  const { buildHeap } = getContext()

  // return a cached build if possible
  const cachedLogic = getCachedBuiltLogic(wrapper, props)
  if (cachedLogic) {
    return cachedLogic
  }

  // create a random path
  const uniqueId = ++getContext().input.counter
  const path = [...getContext().options.defaultPath, uniqueId]
  let finishedBuild = false

  // create a blank logic, and add the basic fields and methods
  // other core fields (actions, selectors, values, etc) are added with other plugins below.
  const logic = {
    _isKeaBuild: true,
    key: undefined,
    keyBuilder: undefined,
    path: path,
    pathString: path.join('.'),
    props: props ?? {},

    // methods
    wrapper,
    extend: (input: LogicInput) => applyInputToLogic(logic, input),
    mount: () => {
      if (!finishedBuild) {
        throw new Error(`[KEA] Tried to mount logic "${logic.pathString}" before it finished building`)
      }
      mountLogic(logic)
      let unmounted = false
      return () => {
        if (unmounted) {
          throw new Error(`[KEA] Tried to unmount logic "${logic.pathString}" for a second time`)
        }
        unmountLogic(logic)
        unmounted = true
      }
    },
    unmount: () => unmountLogic(logic),
    isMounted: () => {
      const counter = getContext().mount.counter[logic.pathString]
      return typeof counter === 'number' && counter > 0
    },
  } as any as BuiltLogic<L>

  // initialize defaults fields as requested by plugins, including core
  for (const plugin of getContext().plugins.activated) {
    if (plugin.defaults) {
      const defaults = typeof plugin.defaults === 'function' ? plugin.defaults() : plugin.defaults
      Object.assign(logic, defaults)
    }
  }

  buildHeap.push(logic)
  runPlugins('beforeBuild', logic, wrapper.inputs)

  // apply all the inputs and builders
  for (const input of wrapper.inputs) {
    applyInputToLogic(logic, input)
  }

  // add a connection to ourselves in the end
  logic.connections[logic.pathString] = logic

  runPlugins('afterBuild', logic, wrapper.inputs)
  buildHeap.pop()

  // cache the logic object
  finishedBuild = true
  setCachedBuiltLogic(wrapper, props, logic)

  // if we were building something when this got triggered, add this as a dependency for the previous logic
  if (buildHeap.length > 0) {
    if (!buildHeap[buildHeap.length - 1].connections[logic.pathString]) {
      addConnection(buildHeap[buildHeap.length - 1], logic)
    }
  }

  return logic
}

export function getCachedBuiltLogic<L extends Logic = Logic>(
  wrapper: LogicWrapper<L>,
  props: Props | undefined,
): BuiltLogic<L> | null {
  const { wrapperContexts } = getContext()
  const wrapperContext = wrapperContexts.get(wrapper) as WrapperContext<L> | undefined
  const builtLogic = wrapperContext?.builtLogics.get(wrapperContext?.keyBuilder?.(props ?? {}))
  return builtLogic ?? null
}

export function setCachedBuiltLogic<L extends Logic = Logic>(
  wrapper: LogicWrapper<L>,
  props: Props | undefined,
  logic: BuiltLogic<L>,
): void {
  const { wrapperContexts } = getContext()
  let wrapperContext = wrapperContexts.get(wrapper)
  if (!wrapperContext) {
    wrapperContext = { keyBuilder: logic.keyBuilder, builtLogics: new Map() }
    wrapperContexts.set(wrapper, wrapperContext)
  }
  wrapperContext.builtLogics.set(logic.key, logic)
}
