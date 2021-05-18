import { getContext } from '../context'

import { getBuiltLogic } from './build'

import { wrapComponent } from '../react/wrap'
import { getPathForInput } from './path'
import {
  AnyComponent,
  BuiltLogicAdditions,
  KeaComponent,
  Logic,
  LogicInput,
  LogicWrapper,
  LogicWrapperAdditions,
  Props,
} from '../types'

/*

  Initializes logic and creates a wrapper that can be used to mount the logic or wrap
  it around React components.

  Logic Wrapper:

  - const logic = kea(input)

  Default behaviour (see below for explanations):

  - logic()          === logic.build()
  - logic(props)     === logic.build(props)
  - logic(Component) === logic.wrap(Component)

  Functions defined on wrappers:

  - logic.wrap(Component) # wrap around a React component
  - logic.build(props)    # build logic; optionally using props
  - logic.extend(input)   # add more input; does not alter already built logic

  Built Logic:

  - builtLogic = logic(props) = logic.build(props)

  Functions on built logic:

  - builtLogic.mount()         # mount the logic and return a function to unmount
  - builtLogic.mount(callback) # mount, run callback and unmount immediately

  Fields on built logic (core plugin):

  - builtLogic.path
  - builtLogic.pathString
  - builtLogic.props

  - builtLogic.connections
  - builtLogic.constants
  - builtLogic.actions
  - builtLogic.defaults
  - builtLogic.reducers
  - builtLogic.reducerOptions
  - builtLogic.reducer
  - builtLogic.selector
  - builtLogic.selectors
  - builtLogic.propTypes

  NB! If your input does not have a key, all the builtLogic fields can be directly
      accessed with logic.field (e.g. logic.actions). All these fields are
      automatically passed through logic.build(), so:

      logic.actions === logic().actions === logic.build().actions

      If your input has a key, you must build it with props before you can access
      its fields:

      logic(props).actions === logic.build(props).actions

  PS! Building logic is a fast operation. If we have already built the logic for the
      corresponding input and key combination (the key is derived from props), it
      will just be returned from the cache and connected with the new props.
      Feel free to call logic(props) as often as you need to.

  Constants on logic wrappers and built logic:

  - logic._isKea           # true if logic wrapper
  - logic._isKeaWithKey    # true if input has a `key` field

  - builtLogic._isKeaBuild # true if built logic

*/

export function proxyFieldToLogic(wrapper: LogicWrapper, key: keyof Logic): void {
  if (!wrapper.hasOwnProperty(key)) {
    Object.defineProperty(wrapper, key, {
      get: function () {
        const {
          mount: { mounted },
          build: { heap: buildHeap },
          run: { heap: runHeap },
        } = getContext()
        const path = getPathForInput(wrapper.inputs[0], {})
        const pathString = path.join('.')

        // if mounted or building as a connected dependency, return the proxied value
        if (mounted[pathString] || buildHeap.length > 0 || runHeap.length > 0 || key === 'constants') {
          return wrapper.build()[key]
        } else {
          throw new Error(`[KEA] Can not access "${key}" on logic "${pathString}" because it is not mounted!`)
        }
      },
    })
  }
}

export function proxyFields(wrapper: LogicWrapper): void {
  const {
    options: { proxyFields },
    plugins: { logicFields },
  } = getContext()

  if (proxyFields) {
    const reservedProxiedKeys = ['path', 'pathString', 'props'] as ['path', 'pathString', 'props']
    for (const key of reservedProxiedKeys) {
      proxyFieldToLogic(wrapper, key)
    }
    for (const key of Object.keys(logicFields)) {
      proxyFieldToLogic(wrapper, key as keyof Logic)
    }
  }
}

export function kea<LogicType extends Logic = Logic>(
  input: LogicInput<LogicType>,
): LogicType & LogicWrapperAdditions<LogicType> {
  const wrapper: LogicType & LogicWrapperAdditions<LogicType> = (function (
    args: undefined | AnyComponent,
  ): (LogicType & BuiltLogicAdditions<LogicType>) | KeaComponent {
    if (typeof args === 'object' || typeof args === 'undefined') {
      return wrapper.build(args) as LogicType & BuiltLogicAdditions<LogicType>
    }
    return wrapper.wrap(args)
  } as any) as LogicType & LogicWrapperAdditions<LogicType>

  wrapper._isKea = true
  wrapper._isKeaWithKey = typeof input.key !== 'undefined'

  wrapper.inputs = [input as LogicInput]

  wrapper.wrap = (Component: AnyComponent) => wrapComponent(Component, wrapper)
  wrapper.build = (props?: Props, autoConnectInListener = true) =>
    getBuiltLogic(wrapper.inputs, props, wrapper, autoConnectInListener) as LogicType & BuiltLogicAdditions<LogicType>
  wrapper.mount = (callback) => wrapper.build().mount(callback)
  wrapper.extend = <ExtendLogicType extends Logic = LogicType>(extendedInput: LogicInput<ExtendLogicType>) => {
    wrapper.inputs.push(extendedInput as LogicInput)
    return (wrapper as unknown) as ExtendLogicType & LogicWrapperAdditions<ExtendLogicType>
  }

  if (!wrapper._isKeaWithKey) {
    // so we can call wrapper.something directly
    proxyFields(wrapper)
    getContext().options.autoMount && wrapper.mount()
  }

  return wrapper
}

export function connect<LogicType extends Logic = Logic>(
  input: LogicInput['connect'],
): LogicType & LogicWrapperAdditions<LogicType> {
  return kea({ connect: input })
}
