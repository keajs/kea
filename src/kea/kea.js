import { getContext } from '../context'

import { getBuiltLogic } from './build'
import { getPathForInput } from './path'

import { wrapComponent } from '../react/wrap'
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
export function kea (input) {
  let wrapper = function (args) {
    if (typeof args === 'object' || typeof args === 'undefined') {
      return wrapper.build(args)
    }
    return wrapper.wrap(args)
  }

  wrapper._isKea = true
  wrapper._isKeaWithKey = typeof input.key !== 'undefined'

  wrapper.inputs = [input]

  wrapper.wrap = Component => wrapComponent(Component, wrapper)
  wrapper.build = props => getBuiltLogic(wrapper.inputs, props, wrapper)
  wrapper.mount = callback => wrapper.build().mount(callback)

  wrapper.extend = (extendedInput) => {
    wrapper.inputs.push(extendedInput)
    return wrapper
  }

  if (!input.key) {
    getContext().options.autoMount && wrapper.mount && wrapper.mount()
  }

  return wrapper
}

export function connect (input) {
  return kea({ connect: input })
}
