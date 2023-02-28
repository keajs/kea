import { runPlugins } from './plugins'
import { getContext } from './context'

import { mountLogic, unmountLogic } from './mount'

import { Logic, LogicWrapper, Props, LogicInput, BuiltLogic, LogicBuilder, WrapperContext, KeyType } from '../types'
import { addConnection } from '../core/connect'
import { key, path, props } from '../core'
import { shallowCompare } from '../utils'
import { batchChanges } from '../react/hooks'

// Converts `input` into `logic` by running all build steps in succession
function applyInputToLogic(logic: BuiltLogic, input: LogicInput | LogicBuilder) {
  runPlugins('beforeLogic', logic, input)

  // Logic builder
  if (typeof input === 'function') {
    input(logic)
  } else {
    // Legacy kea({}) object style
    'props' in input && props(input.props)(logic)
    'key' in input && typeof input.key !== 'undefined' && key(input.key)(logic)
    'path' in input && input.path && path(input.path)(logic)

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
  const wrapperContext = getWrapperContext(wrapper)
  if (wrapperContext.isBuilding) {
    throw new Error(`[KEA] Circular build detected.`)
  }

  const cachedLogic = getCachedBuiltLogicByProps(wrapper, props)
  if (cachedLogic) {
    let prevPropsClone: Props | null = null
    if (
      props &&
      (!cachedLogic.props ||
        (cachedLogic.lastProps !== props &&
          (!shallowCompare(cachedLogic.lastProps, props) ||
            !shallowCompare(cachedLogic.props, { ...cachedLogic.props, ...props }))))
    ) {
      prevPropsClone = { ...cachedLogic.props }
      Object.assign(cachedLogic.props, props)
      cachedLogic.lastProps = props
    }
    if (prevPropsClone && cachedLogic.events.propsChanged) {
      const newPropsClone = { ...cachedLogic.props }
      batchChanges(() => {
        cachedLogic.events.propsChanged?.(newPropsClone, prevPropsClone)
      })
    }
    return cachedLogic
  }

  // create a random path
  const uniqueId = ++getContext().inputCounter
  const path = [...getContext().options.defaultPath, uniqueId]
  ;(path as any)['_keaAutomaticPath'] = true
  wrapperContext.isBuilding = true

  // create a blank logic, and add the basic fields and methods
  // other core fields (actions, selectors, values, etc) are added with other plugins below.
  const logic = {
    _isKeaBuild: true,
    key: undefined,
    keyBuilder: undefined,
    path: path,
    pathString: path.join('.'),
    props: { ...props },
    lastProps: props ?? {},

    // methods
    wrapper,
    extend: (input: LogicInput) => applyInputToLogic(logic, input),
    mount: () => {
      if (wrapperContext.isBuilding) {
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

  const { buildHeap } = getContext()
  try {
    buildHeap.push(logic)

    // initialize defaults fields as requested by plugins, including core
    for (const plugin of getContext().plugins.activated) {
      if (plugin.defaults) {
        const newLogicProperties = typeof plugin.defaults === 'function' ? plugin.defaults() : plugin.defaults
        Object.assign(logic, newLogicProperties)
      }
    }

    runPlugins('beforeBuild', logic, wrapper.inputs)

    // apply all the inputs and builders
    for (const input of wrapper.inputs) {
      applyInputToLogic(logic, input)
    }

    // add a connection to ourselves in the end
    logic.connections[logic.pathString] = logic

    wrapperContext.keyBuilder = logic.keyBuilder
    wrapperContext.builtLogics.set(logic.key, logic)

    runPlugins('afterBuild', logic, wrapper.inputs)
  } catch (e) {
    throw e
  } finally {
    wrapperContext.isBuilding = false
    buildHeap.pop()
  }

  // if we were building something when this got triggered, add this as a dependency for the previous logic
  if (buildHeap.length > 0) {
    if (!buildHeap[buildHeap.length - 1].connections[logic.pathString]) {
      addConnection(buildHeap[buildHeap.length - 1], logic)
    }
  }

  return logic
}

export function getCachedBuiltLogicByKey<L extends Logic = Logic>(
  wrapper: LogicWrapper<L>,
  key: KeyType | undefined,
): BuiltLogic<L> | null {
  const wrapperContext = getWrapperContext(wrapper)
  const builtLogic = wrapperContext.builtLogics.get(key)
  return builtLogic ?? null
}

export function getCachedBuiltLogicByProps<L extends Logic = Logic>(
  wrapper: LogicWrapper<L>,
  props: Props | undefined,
): BuiltLogic<L> | null {
  const wrapperContext = getWrapperContext(wrapper)
  return getCachedBuiltLogicByKey<L>(wrapper, wrapperContext?.keyBuilder?.(props ?? {}))
}

export function getWrapperContext<L extends Logic = Logic>(wrapper: LogicWrapper<L>): WrapperContext<L> {
  const { wrapperContexts } = getContext()
  let wrapperContext = wrapperContexts.get(wrapper) as WrapperContext<L> | undefined
  if (!wrapperContext) {
    wrapperContext = { keyBuilder: undefined, builtLogics: new Map(), isBuilding: false }
    wrapperContexts.set(wrapper, wrapperContext)
  }
  return wrapperContext
}
