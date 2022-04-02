import { runPlugins } from './plugins'
import { getContext } from './context'

import { mountLogic, unmountLogic } from './mount'

import { Logic, LogicWrapper, Props, LogicInput, BuiltLogic, LogicBuilder } from '../types'

// Converts `input` into `logic` by running all build steps in succession
function applyInputToLogic(logic: BuiltLogic, input: LogicInput | LogicBuilder) {
  runPlugins('beforeLogic', logic, input)

  if (typeof input === 'function') {
    input(logic)
  } else {
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
  // return a cached build if possible
  const cachedLogic = getCachedBuiltLogic(wrapper, props)
  if (cachedLogic) {
    return cachedLogic
  }

  // create a blank logic with a random path
  const uniqueId = ++getContext().input.counter
  const path = [...getContext().options.defaultPath, uniqueId]
  const logic = {
    _isKeaBuild: true,
    key: undefined,
    path: path,
    pathString: path.join('.'),
    props,
    wrapper,
    extend: (input: LogicInput) => applyInputToLogic(logic, input),
    mount: () => {
      mountLogic(logic)
      return () => unmountLogic(logic)
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

  // apply all the inputs
  runPlugins('beforeBuild', logic, wrapper.inputs)
  for (const input of wrapper.inputs) {
    applyInputToLogic(logic, input)
  }

  // add a connection to ourselves in the end
  // logic.connections = { ...logic.connections, 'scenes.path.to.logic': logic }
  logic.connections[logic.pathString] = logic

  runPlugins('afterBuild', logic, wrapper.inputs)

  setCachedBuiltLogic(wrapper, props, logic)

  return logic
}

export function getCachedBuiltLogic<L extends Logic = Logic>(
  wrapper: LogicWrapper<L>,
  props: Props | undefined,
): BuiltLogic<L> | null {
  const buildCache = getContext().build.cache
  const inputCache = buildCache.get(wrapper)
  if (inputCache) {
    const builtLogic = inputCache.builtLogics.get(inputCache.keyBuilder?.(props))
    if (builtLogic) {
      return builtLogic as BuiltLogic<L>
    }
  }
  return null
}

export function setCachedBuiltLogic<L extends Logic = Logic>(
  wrapper: LogicWrapper<L>,
  props: Props | undefined,
  logic: BuiltLogic<L>
): void {
  const buildCache = getContext().build.cache
  const inputCache = buildCache.get(wrapper)
  if (inputCache) {
    inputCache.builtLogics.set(logic.key, logic)
  } else {
    buildCache.set(wrapper, { keyBuilder: logic.keyBuilder, builtLogics: new Map([[logic.key, logic]]) })
  }
}
