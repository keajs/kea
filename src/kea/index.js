import React, { useEffect } from 'react'
import { connect as reduxConnect } from 'react-redux'

import { convertInputToLogic, convertPartialDynamicInput, clearLogicCache } from '../logic/index'
import { plugins as globalPlugins } from '../plugins'
import { attachReducer, detachReducer } from '../store/reducer'

let mountedPaths = {}

export function kea (input) {
  const plugins = input.plugins && input.plugins.length > 0 ? [...globalPlugins, ...input.plugins] : [...globalPlugins]
  const lazy = (input.options && input.options.lazy) || false

  const wrapper = (Klass) => {
    injectActionsIntoClass(Klass)

    const Connect = reduxConnect(
      mapStateToPropsCreator(input, plugins, lazy),
      mapDispatchToPropsCreator(input, plugins, lazy)
    )(Klass)

    return function Kea (props) {
      const logic = convertInputToLogic({ input, props, plugins, connectToStore: !lazy })

      plugins.forEach(p => p.beforeMount && p.beforeMount(logic, props))

      preMountPaths(logic, plugins, lazy)

      useEffect(() => {
        mountPaths(logic, plugins, lazy)
        return () => unmountPaths(logic, plugins, lazy)
      }, [logic.path])

      plugins.forEach(p => p.beforeRender && p.beforeRender(logic, props))

      return <Connect {...props} />
    }
  }

  // TODO: legacy names. remove them?
  wrapper._isKeaFunction = true
  wrapper._isKeaSingleton = !input.key

  if (!input.key) {
    Object.assign(wrapper, convertInputToLogic({ input, plugins, connectToStore: !lazy }))
  } else {
    Object.assign(wrapper, convertPartialDynamicInput({ input, plugins }))
    wrapper.withKey = (key) => convertInputToLogic({ input, key, plugins, connectToStore: !lazy })
  }

  return wrapper
}

export function connect (input) {
  return kea({ connect: input })
}

const mapStateToPropsCreator = (input, plugins, lazy) => (state, ownProps) => {
  const logic = convertInputToLogic({ input, props: ownProps, plugins, connectToStore: lazy })

  let resp = {}
  Object.entries(logic.selectors).forEach(([key, selector]) => {
    resp[key] = selector(state, ownProps)
  })

  return resp
}

const mapDispatchToPropsCreator = (input, plugins, lazy) => (dispatch, ownProps) => {
  const logic = convertInputToLogic({ input, props: ownProps, plugins, connectToStore: lazy })

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

export function preMountPaths (logic, plugins, lazy) {
  Object.keys(logic.connections).forEach(path => {
    if ((mountedPaths[path] || 0) === 0) {
      const preMountedLogic = logic.connections[path]

      if (lazy && preMountedLogic.reducer) {
        attachReducer(preMountedLogic.path, preMountedLogic.reducer)
      }

      plugins.forEach(p => p.preMountedLogic && p.preMountedLogic(path, preMountedLogic))
    }
  })
}

export function mountPaths (logic, plugins, lazy) {
  Object.keys(logic.connections).forEach(path => {
    mountedPaths[path] = (mountedPaths[path] || 0) + 1
    if (mountedPaths[path] === 1) {
      const mountedLogic = logic.connections[path]

      if (lazy && mountedLogic.reducer) {
        attachReducer(mountedLogic.path, mountedLogic.reducer)
      }

      plugins.forEach(p => p.mountedPath && p.mountedPath(path, mountedLogic))
    }
  })
}

export function unmountPaths (logic, plugins, lazy) {
  Object.keys(logic.connections).reverse().forEach(path => {
    mountedPaths[path] = (mountedPaths[path] || 0) - 1
    if (mountedPaths[path] === 0) {
      const unmountedLogic = logic.connections[path]

      if (lazy && unmountedLogic.reducer) {
        detachReducer(unmountedLogic.path, unmountedLogic.reducer)
      }

      plugins.forEach(p => p.unmountedPath && p.unmountedPath(path, unmountedLogic))
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
