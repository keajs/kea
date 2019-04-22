import React, { useEffect } from 'react'
import { connect as reduxConnect } from 'react-redux'

import { convertInputToLogic, convertPartialDynamicInput, clearLogicCache } from '../logic/index'
import { plugins as globalPlugins } from '../plugins'

let mountedPaths = {}

export function kea (input) {
  const plugins = input.plugins && input.plugins.length > 0 ? [...globalPlugins, ...input.plugins] : [...globalPlugins]

  const wrapper = (Klass) => {
    injectActionsIntoClass(Klass)

    const Connect = reduxConnect(
      mapStateToPropsCreator(input, plugins),
      mapDispatchToPropsCreator(input, plugins)
    )(Klass)

    return function Kea (props) {
      const logic = convertInputToLogic({ input, props, plugins })

      plugins.forEach(p => p.beforeMount && p.beforeMount(logic, props))

      useEffect(() => {
        mountPaths(logic, plugins)
        return () => unmountPaths(logic, plugins)
      }, [logic.path])

      plugins.forEach(p => p.beforeRender && p.beforeRender(logic, props))

      return <Connect {...props} />
    }
  }

  // TODO: legacy names. remove them?
  wrapper._isKeaFunction = true
  wrapper._isKeaSingleton = !input.key

  if (!input.key) {
    Object.assign(wrapper, convertInputToLogic({ input, plugins }))
  } else {
    Object.assign(wrapper, convertPartialDynamicInput({ input, plugins }))
    wrapper.withKey = (key) => convertInputToLogic({ input, key, plugins })
  }

  return wrapper
}

export function connect (input) {
  return kea({ connect: input })
}

const mapStateToPropsCreator = (input, plugins) => (state, ownProps) => {
  const logic = convertInputToLogic({ input, props: ownProps, plugins })

  let resp = {}
  Object.entries(logic.selectors).forEach(([key, selector]) => {
    resp[key] = selector(state, ownProps)
  })

  return resp
}

const mapDispatchToPropsCreator = (input, plugins) => (dispatch, ownProps) => {
  const logic = convertInputToLogic({ input, props: ownProps, plugins })

  let actions = Object.assign({}, ownProps.actions)

  Object.entries(logic.actions).forEach(([key, action]) => {
    actions[key] = (...args) => dispatch(action(...args))
  })

  return {
    dispatch: dispatch,
    actions: actions
  }
}

function isStateless (Component) {
  return (
    typeof Component === 'function' && // can be various things
    !(Component.prototype && Component.prototype.isReactComponent) // native arrows don't have prototypes // special property
  )
}

function injectActionsIntoClass (Klass) {
  if (!isStateless(Klass)) {
    // inject to the component something that
    // converts this.props.actions to this.actions
    if (!Object.getOwnPropertyDescriptor(Klass.prototype, 'actions')) {
      Object.defineProperty(Klass.prototype, 'actions', {
        get: function actions () {
          return this.props.actions
        }
      })
    }
  }
}

export function mountPaths (logic, plugins) {
  Object.keys(logic.connections).forEach(path => {
    mountedPaths[path] = (mountedPaths[path] || 0) + 1
    if (mountedPaths[path] === 1) {
      plugins.forEach(p => p.mountedPath && p.mountedPath(path, logic.connections[path]))
    }
  })
}

export function unmountPaths (logic, plugins) {
  Object.keys(logic.connections).forEach(path => {
    mountedPaths[path] = (mountedPaths[path] || 0) - 1
    if (mountedPaths[path] === 0) {
      plugins.forEach(p => p.unmountedPath && p.unmountedPath(path, logic.connections[path]))
    }
  })
}

export function clearMountedPaths () {
  mountedPaths = {}
}

export function resetKeaLogicCache () {
  clearLogicCache()
  clearMountedPaths()
}
