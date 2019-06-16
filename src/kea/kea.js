import { getContext } from '../context'

import { createConstants } from '../core/steps/constants'
import { reservedProxiedKeys } from '../plugins'

import { getBuiltLogic } from './logic'
import { wrapComponent } from '../react/wrap'
/*
  Initialize logic and create a wrapper function that can be used to apply this
  logic onto React components.

  const logic = kea(input)

  The wrapper will delegate all the fields of the logic onto the logic itself
  and define a few functions to manipulate the logic's state on the context (e.g mounting)

  NB! This list is a work in progress and will still change
  Default:

  - logic(Component) === logic.wrap(Component) 
  - logic(props) === logic.build(props)

  Constants:

  - logic._isKea
  - logic._isKeaWithKey

  Functions defined on wrappers:

  - logic.wrap(Component)
  - logic.build(props)
  - logic.extend(input)

  Functions on built logic:

  - logic.mount(props)

  Delegated fields on wrappers without keys:

  - logic.path
  - logic.pathString
  - logic.props

  - logic.connections
  - logic.constants
  - logic.actions
  - logic.defaults
  - logic.reducers
  - logic.reducerOptions
  - logic.reducer
  - logic.selector
  - logic.selectors
  - logic.propTypes

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

  wrapper.extend = (extendedInput) => {
    // // TODO: update for props on isBuilt.... use isAnyBuilt?
    // if (!input.key && wrapper.isBuilt()) {
    //   throw new Error('[KEA] Can not extend logic once it has been built!')
    // }
    wrapper.inputs.push(extendedInput)
    return wrapper
  }

  wrapper.build = (props) => {
    return getBuiltLogic(wrapper.inputs, props)
  }

  if (input.key) {
    // TODO: this is a bit silly...
    if (input.constants) {
      wrapper.constants = {}
      createConstants(wrapper, input)
    }  
  } else {
    const { options: { proxyFields }, plugins: { logicFields } } = getContext()

    if (proxyFields) {
      for (const key of Object.keys(logicFields)) {
        proxyFieldToLogic(wrapper, key)
      }
      for (const key of reservedProxiedKeys) {
        proxyFieldToLogic(wrapper, key)
      }
    }
  }

  getContext().options.autoMount && wrapper.mount && wrapper.mount()

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
