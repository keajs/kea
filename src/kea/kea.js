import { getContext } from '../context'

import { reservedProxiedKeys } from '../plugins'

import { getBuiltLogic } from './build'
import { wrapComponent } from '../react/wrap'
/*
  const logic = kea(input)

  Initializes logic and creates a wrapper that can be used to mount the logic or wrap
  it around React components.

  Default:

  - logic()          === logic.build()
  - logic(props)     === logic.build(props)
  - logic(Component) === logic.wrap(Component) 

  Functions defined on wrappers:

  - logic.wrap(Component) # wrap around a React component
  - logic.build(props)    # build logic; optionally using props
  - logic.extend(input)   # add more input; does not alter already built logic

  Functions on built logic:

  - builtLogic.mount()         # mount the logic and return a function to unmount
  - builtLogic.mount(callback) # mount, run callback and unmount immediately

  Core fields on built logic:

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

  - builtLogic._isBuiltLogic === true

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
      So feel free to call logic(props) as often as you need to.

  Constants:

  - logic._isKea        # true always
  - logic._isKeaWithKey # true if input has a `key` field

*/
export function kea (input) {
  const wrapper = function (args) {
    if (typeof args === 'object' || typeof args === 'undefined') {
      return wrapper.build(args)
    }
    return wrapper.wrap(args)
  }

  wrapper._isKea = true
  wrapper._isKeaWithKey = typeof input.key !== 'undefined'

  wrapper.inputs = [input]
  
  wrapper.wrap = Component => wrapComponent(Component, wrapper)
  wrapper.build = props => getBuiltLogic(wrapper.inputs, props)

  wrapper.extend = (extendedInput) => {
    wrapper.inputs.push(extendedInput)
    return wrapper
  }

  if (!input.key) {
    const { options: { proxyFields }, plugins: { logicFields } } = getContext()

    if (proxyFields) {
      for (const key of Object.keys(logicFields)) {
        proxyFieldToLogic(wrapper, key)
      }
      for (const key of reservedProxiedKeys) {
        proxyFieldToLogic(wrapper, key)
      }
    }

    getContext().options.autoMount && wrapper.mount && wrapper.mount()
  }

  return wrapper
}

export function connect (input) {
  return kea({ connect: input })
}

function proxyFieldToLogic (wrapper, key) {
  Object.defineProperty(wrapper, key, {
    get: function () {
      return wrapper.build()[key]
    }
  })
}
