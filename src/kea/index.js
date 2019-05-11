import React, { useEffect, useRef } from 'react'
import { connect as reduxConnect } from 'react-redux'

import { convertInputToLogic, convertPartialDynamicInput } from '../logic/index'
import { hasConnectWithKey } from '../core/shared/connect'
import { attachReducer } from '../store/reducer'

import { getLocalPlugins, runPlugins } from '../plugins'

import { mountPaths, unmountPaths } from './mount'

export function kea (input) {
  const plugins = getLocalPlugins(input)

  runPlugins(plugins, 'beforeKea', input)

  const lazy = (input.options && input.options.lazy) || !!input.key || hasConnectWithKey(input.connect) || false

  const wrapper = (Klass) => {
    runPlugins(plugins, 'beforeWrapper', input, Klass)

    // make this.actions work if it's a React.Component we're operating with
    injectActionsIntoClass(Klass)

    const Connect = reduxConnect(
      mapStateToPropsCreator(input, plugins),
      mapDispatchToPropsCreator(input, plugins)
    )(Klass)

    // inject proptypes into the class if it's a React.Component
    // not using useRef here since we do it only once per component
    let injectPropTypes = !isStateless(Klass)

    const Kea = function (props) {
      const logic = convertInputToLogic({ input, props, plugins })

      // inject proptypes to React.Component
      if (injectPropTypes && logic.propTypes) {
        injectPropTypes = false
        Klass.propTypes = Object.assign(Klass.propTypes || {}, logic.propTypes)
      }

      // mount paths only on first render
      const firstRender = useRef(true)
      if (firstRender.current) {
        firstRender.current = false

        // give access to the logic to the return value
        if (lazy) {
          Object.assign(wrapper, logic)
        }

        mountPaths(logic, plugins)
      }

      // unmount paths when component gets removed
      useEffect(() => () => unmountPaths(logic, plugins, lazy), [])

      // TODO: unmount & remount if path changed

      runPlugins(plugins, 'beforeRender', logic, props)

      return <Connect {...props} />
    }

    runPlugins(plugins, 'afterWrapper', input, Klass, Kea)

    return Kea
  }

  // TODO: legacy names. remove/change them?
  wrapper._isKeaFunction = true
  wrapper._isKeaSingleton = !lazy

  if (input.key) {
    wrapper.withKey = keyCreator => {
      const buildWithProps = props => {
        const logic = convertInputToLogic({ input, key: keyCreator(props), props, plugins })
        return Object.assign({}, wrapper, logic)
      }
      buildWithProps._isKeaWithKey = true
      return buildWithProps
    }
    wrapper.buildWithKey = (key) => {
      const logic = convertInputToLogic({ input, key, plugins })
      return Object.assign({}, wrapper, logic)
    }
  } else if (lazy) {
    wrapper.build = () => {
      const logic = convertInputToLogic({ input, plugins })
      wrapper.build._mustBuild = false
      return Object.assign(wrapper, logic)
    }
    wrapper.build._mustBuild = true
  }

  if (!lazy) {
    const logic = convertInputToLogic({ input, plugins })

    // if we're in eager mode (!lazy), attach the reducer directly
    if (!lazy && logic.reducer && !logic.mounted) {
      attachReducer(logic.path, logic.reducer)
      logic.mounted = true
    }

    Object.assign(wrapper, logic)
  } else {
    Object.assign(wrapper, convertPartialDynamicInput({ input, plugins }))
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
