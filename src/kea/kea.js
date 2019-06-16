import React, { useEffect, useRef } from 'react'
import { connect as reduxConnect } from 'react-redux'

import { getContext } from '../context'

import { createConstants } from '../core/steps/constants'
import { runPlugins, reservedProxiedKeys } from '../plugins'

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
  wrapper.wrap = createWrapFunction(wrapper)

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

function createWrapFunction (wrapper) {
  const { inputs } = wrapper

  return (Klass) => {
    const input = inputs[0]
    runPlugins('beforeWrapper', input, Klass)

    // make this.actions work if it's a React.Component we're operating with
    injectActionsIntoClass(Klass)

    let isUnmounting = {}
    let lastState = {}

    const createConnect = reduxConnect(
      (state, props) => {
        // At the moment when we unmount and detach from redux, react-redux will still be subscribed to the store
        // and will run this function to see if anything changed. Since we are detached from the store, all
        // selectors of this logic will crash. To avoid this, cache and return the last state.
        // Nothing will be rendered anyway.
        const key = input.key ? input.key(props) : '*'
        if (isUnmounting[key]) {
          return lastState[key]
        }

        const logic = getBuiltLogic(inputs, props)

        let resp = {}
        Object.entries(logic.selectors).forEach(([key, selector]) => {
          resp[key] = selector(state, props)
        })

        lastState[key] = resp

        return resp
      },
      (dispatch, props) => {
        const logic = getBuiltLogic(inputs, props)

        let actions = Object.assign({}, props.actions)

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
      const logic = getBuiltLogic(inputs, props)
      const pathString = useRef(logic.pathString)

      if (pathString.current !== logic.pathString) {
        throw new Error(`Changing the logic's key after rendering is not supported. From: ${pathString.current}, to: ${logic.pathString}.`)
      }

      // inject proptypes to React.Component
      if (injectPropTypes && logic.propTypes) {
        injectPropTypes = false
        Klass.propTypes = Object.assign(Klass.propTypes || {}, logic.propTypes)
      }

      // mount paths only on first render
      const firstRender = useRef(true)
      if (firstRender.current) {
        firstRender.current = false

        mountPaths(logic)
      }

      // unmount paths when component gets removed
      useEffect(() => () => {
        // set this as mapStateToProps can still run even if we have detached from redux
        const key = input.key ? input.key(props) : '*'
        isUnmounting[key] = true
        unmountPaths(logic)
        delete isUnmounting[key]
        delete lastState[key]
      }, [])

      runPlugins('beforeRender', logic, props)
      return <Connect {...props} />
    }

    Kea._wrapper = wrapper
    Kea._wrappedKlass = Klass

    runPlugins('afterWrapper', input, Klass, Kea)
    return Kea
  }
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
