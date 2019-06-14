import React, { useEffect, useRef } from 'react'
import { connect as reduxConnect } from 'react-redux'

import { getContext } from '../context'

import { createConstants } from '../core/steps/constants'
import { getLocalPlugins, runPlugins, reservedProxiedKeys } from '../plugins'

import { getBuiltLogic } from './logic'
import { getPathStringForInput } from './path'
import { mountPaths, unmountPaths } from './mount'

/*
  Initialize logic and create a wrapper function that can be used to apply this
  logic onto React components.

  const logic = kea(input)

  The wrapper will delegate all the fields of the logic onto the logic itself
  and define a few functions to manipulate the logic's state on the context (e.g mounting)

  NB! This list is a work in progress and will still change

  Constants:

  - logic._isKea
  - logic._isKeaWithKey

  Functions defined on all wrappers:

  - logic.extend

  Functions defined on wrappers with keys:

  - logic.withKey
  - logic.buildWithKey
  - logic.mountWithKey

  Functions defined on wrappers without keys:

  - logic.isBuilt
  - logic.build
  - logic.mount

  Delegated fields on wrappers without keys:

  - logic.path
  - logic.pathString
  - logic.plugins
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
  // TODO: this might not be needed
  storeInputOnContext(input)

  const wrapper = createWrapperFunction(input)

  wrapper._isKea = true
  wrapper._isKeaWithKey = typeof input.key !== 'undefined'

  wrapper._extendWith = []
  wrapper.extend = (extendedInput) => {
    if (!input.key && wrapper.isBuilt()) {
      throw new Error('[KEA] Can not extend logic once it has been built!')
    }
    wrapper._extendWith.push(extendedInput)
    return wrapper
  }

  if (input.key) {
    wrapper.buildWithKey = (key) => {
      return getBuiltLogic({ input, key, extendedInputs: wrapper._extendWith })
    }

    wrapper.withKey = keyCreator => {
      if (typeof keyCreator === 'function') {
        const buildWithProps = props => getBuiltLogic({ input, key: keyCreator(props), props, extendedInputs: wrapper._extendWith })
        buildWithProps._isKeaBuildWithProps = true
        return buildWithProps
      } else {
        return wrapper.buildWithKey(keyCreator)
      }
    }

    wrapper.mountWithKey = (key) => {
      const plugins = getLocalPlugins(input)
      const logic = wrapper.buildWithKey(key)

      mountPaths(logic, plugins)
      return () => unmountPaths(logic, plugins)
    }

    // TODO: this is a bit silly...
    if (input.constants) {
      wrapper.constants = {}
      createConstants(wrapper, input)
    }  
  } else {
    const { options: { proxyFields } } = getContext()

    wrapper.isBuilt = (props) => {
      const { build: { cache } } = getContext()
      const key = props && input.key ? input.key(props) : undefined
      const pathString = getPathStringForInput(input, key)

      return !!cache[pathString]
    }

    wrapper.build = (props) => {
      return getBuiltLogic({ input, extendedInputs: wrapper._extendWith, props })
    }
    
    wrapper.mount = (props) => {
      const logic = wrapper.build(props)
      const plugins = getLocalPlugins(input)

      mountPaths(logic, plugins)
      return () => unmountPaths(logic, plugins)
    }

    if (proxyFields) {
      const plugins = getLocalPlugins(input)
      const { logicFields } = plugins
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

function createWrapperFunction (input) {
  const wrapper = (Klass) => {
    const plugins = getLocalPlugins(input)

    runPlugins(plugins, 'beforeWrapper', input, Klass)

    // make this.actions work if it's a React.Component we're operating with
    injectActionsIntoClass(Klass)

    let isUnmounting = {}
    let lastState

    // TODO: why is isUnmounting with a key, but lastState without?
    // it seems to work, but why?

    const createConnect = reduxConnect(
      (state, ownProps) => {
        // At the moment when we unmount and detach from redux, react-redux will still be subscribed to the store
        // and will run this function to see if anything changed. Since we are detached from the store, all
        // selectors of this logic will crash. To avoid this, cache and return the last state.
        // Nothing will be rendered anywa.
        if (isUnmounting[input.key ? input.key(ownProps) : '*']) {
          return lastState
        }

        // TODO: any better way to get it?
        const logic = getBuiltLogic({ input, props: ownProps })

        let resp = {}
        Object.entries(logic.selectors).forEach(([key, selector]) => {
          resp[key] = selector(state, ownProps)
        })

        lastState = resp

        return resp
      },
      (dispatch, ownProps) => {
        // TODO: any better way to get it?
        const logic = getBuiltLogic({ input, props: ownProps })

        let actions = Object.assign({}, ownProps.actions)

        Object.entries(logic.actions).forEach(([key, action]) => {
          actions[key] = (...args) => dispatch(action(...args))
        })

        return {
          dispatch: dispatch,
          actions: actions
        }
      }
    )
    const Connect = createConnect(Klass)

    // inject proptypes into the class if it's a React.Component
    // not using useRef here since we do it only once per component
    let injectPropTypes = !isStateless(Klass)

    const Kea = function (props) {
      // TODO: any better way to get it?
      const logic = getBuiltLogic({ input, props, extendedInputs: wrapper._extendWith })

      // inject proptypes to React.Component
      if (injectPropTypes && logic.propTypes) {
        injectPropTypes = false
        Klass.propTypes = Object.assign(Klass.propTypes || {}, logic.propTypes)
      }

      // mount paths only on first render
      const firstRender = useRef(true)
      if (firstRender.current) {
        firstRender.current = false

        mountPaths(logic, plugins)
      }

      // unmount paths when component gets removed
      useEffect(() => () => {
        // set this as mapStateToProps can still run even if we have detached from redux
        const key = input.key ? input.key(props) : '*'
        isUnmounting[key] = true
        unmountPaths(logic, plugins)
        delete isUnmounting[key]
      }, [])

      // TODO: unmount & remount if path changed
      runPlugins(plugins, 'beforeRender', logic, props)
      return <Connect {...props} />
    }

    Kea._wrapper = wrapper
    Kea._wrappedKlass = Klass

    runPlugins(plugins, 'afterWrapper', input, Klass, Kea)
    return Kea
  }

  return wrapper
}

function isStateless (Component) {
  return (
    typeof Component === 'function' && // can be various things
    !(Component.prototype && Component.prototype.isReactComponent) // native arrows don't have prototypes // special property
  )
}

// inject to the component something that converts this.props.actions to this.actions
function injectActionsIntoClass (Klass) {
  if (!isStateless(Klass)) {
    if (!Object.getOwnPropertyDescriptor(Klass.prototype, 'actions')) {
      Object.defineProperty(Klass.prototype, 'actions', {
        get: function actions () {
          return this.props.actions
        }
      })
    }
  }
}

function proxyFieldToLogic (wrapper, key) {
  Object.defineProperty(wrapper, key, {
    get: function () {
      return wrapper.build()[key]
    }
  })
}

function storeInputOnContext (input) {
  getContext().input.inputs.push(input)
}
