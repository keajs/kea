import React, { useEffect } from 'react'
import { connect as reduxConnect } from 'react-redux'

import { convertInputToLogic, convertPartialDynamicInput, clearLogicCache } from '../logic/index'
import { hasConnectWithKey } from '../logic/connect'
import { plugins as globalPlugins } from '../plugins'
import { attachReducer, detachReducer } from '../store/reducer'

let mountedPaths = {}

export function kea (input) {
  const plugins = input.plugins && input.plugins.length > 0 ? [...globalPlugins, ...input.plugins] : [...globalPlugins]

  const mountDirectly = !input.key && !hasConnectWithKey(input.connect)
  const lazy = (input.options && input.options.lazy) || !mountDirectly || false

  const wrapper = (Klass) => {
    // make this.actions work if it's a React.Component we're operating with
    injectActionsIntoClass(Klass)

    const Connect = reduxConnect(
      mapStateToPropsCreator(input, plugins),
      mapDispatchToPropsCreator(input, plugins)
    )(Klass)

    // inject proptypes into the class if it's a React.Component
    let injectPropTypes = !isStateless(Klass)

    return function Kea (props) {
      const logic = convertInputToLogic({ input, props, plugins })

      // inject proptypes to React.Component
      if (injectPropTypes && logic.propTypes) {
        injectPropTypes = false
        Klass.propTypes = Object.assign(Klass.propTypes || {}, logic.propTypes)
      }

      // run beforeMount plugins
      plugins.forEach(p => p.beforeMount && p.beforeMount(logic, props))

      // mount the paths and logic stores
      mountPaths(logic, plugins)

      // code to run before unmounting
      useEffect(() => () => unmountPaths(logic, plugins, lazy), [])

      // TODO: unmount & remount if path changed

      plugins.forEach(p => p.beforeRender && p.beforeRender(logic, props))

      return <Connect {...props} />
    }
  }

  // TODO: legacy names. remove/change them?
  wrapper._isKeaFunction = true
  wrapper._isKeaSingleton = mountDirectly

  // if we can mount directly (no key or connection to key or anything, do it)
  if (mountDirectly) {
    const logic = convertInputToLogic({ input, plugins })

    // if we're in eager mode (!lazy), attach the reducer directly
    if (!lazy && logic.reducer && !logic.mounted) {
      attachReducer(logic.path, logic.reducer)
      logic.mounted = true
    }

    Object.assign(wrapper, logic)

  // otherwise return a .withKey() function that accepts keys and keyCreators
  } else {
    Object.assign(wrapper, convertPartialDynamicInput({ input, plugins }))

    wrapper.withKey = keyOrCreator => {
      if (typeof keyOrCreator === 'function') {
        const withKey = props => {
          const logic = convertInputToLogic({ input, key: keyOrCreator(props), props, plugins })
          return Object.assign({}, wrapper, logic)
        }
        withKey._isKeaWithKey = true
        return withKey
      } else {
        const logic = convertInputToLogic({ input, key: keyOrCreator, plugins })
        return Object.assign({}, wrapper, logic)
      }
    }
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

export function mountPaths (logic, plugins) {
  Object.keys(logic.connections).forEach(path => {
    mountedPaths[path] = (mountedPaths[path] || 0) + 1
    if (mountedPaths[path] === 1) {
      const mountedLogic = logic.connections[path]

      // attach reducer to redux if not already attached
      if (mountedLogic.reducer && !mountedLogic.mounted) {
        attachReducer(mountedLogic.path, mountedLogic.reducer)
        mountedLogic.mounted = true
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

      if (lazy && unmountedLogic.reducer && unmountedLogic.mounted) {
        detachReducer(unmountedLogic.path, unmountedLogic.reducer)
        unmountedLogic.mounted = true
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
