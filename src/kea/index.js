import React, { useEffect } from 'react'
import { connect } from 'react-redux'

import { convertInputToLogic, convertPartialDynamicInput, clearLogicCache } from '../logic/index'

let mountedPaths = {}

export function kea (input) {
  const wrapper = (Klass) => {
    injectActionsIntoClass(Klass)

    const Connect = connect(
      mapStateToPropsCreator(input),
      mapDispatchToPropsCreator(input)
    )(Klass)

    return function Kea (props) {
      const logic = convertInputToLogic({ input, props })

      useEffect(() => {
        mountPaths(logic.paths)
        return () => unmountPaths(logic.paths)
      }, [logic.paths])

      return <Connect {...props} />
    }
  }

  // TODO: legacy names. remove them?
  wrapper._isKeaFunction = true
  wrapper._isKeaSingleton = !input.key

  if (!input.key) {
    Object.assign(wrapper, convertInputToLogic({ input }))
  } else {
    Object.assign(wrapper, convertPartialDynamicInput(input))
    wrapper.withKey = (key) => convertInputToLogic({ input, key })
  }

  return wrapper
}

const mapStateToPropsCreator = input => (state, ownProps) => {
  const logic = convertInputToLogic({ input, props: ownProps })

  let resp = {}
  Object.entries(logic.selectors).forEach(([key, selector]) => {
    resp[key] = selector(state, ownProps)
  })

  return resp
}

const mapDispatchToPropsCreator = input => (dispatch, ownProps) => {
  const logic = convertInputToLogic({ input, props: ownProps })

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

export function mountPaths (paths) {
  paths.forEach(path => {
    mountedPaths[path] = (mountedPaths[path] || 0) + 1
  })
}

export function unmountPaths (paths) {
  paths.forEach(path => {
    mountedPaths[path] = (mountedPaths[path] || 0) - 1
  })
}

export function clearMountedPaths () {
  mountedPaths = {}
}

export function resetKeaLogicCache () {
  clearLogicCache()
  clearMountedPaths()
}
