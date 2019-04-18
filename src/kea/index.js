import React from 'react'
import { connect } from 'react-redux'

import { convertInputToLogic, convertPartialDynamicInput, clearLogicCache } from '../logic/index'

export function kea (input) {
  // with dynamic logic (key from props) we wrap connect() with our own wrapper
  // to allow the store/state to regenerate before handing it over to mapStateToProps
  // in the future we'll use this to also track which logic stores are mounted and which aren't
  const mustWrapTheWrapper = !!input.key || false

  const wrapper = (Klass) => {
    injectActionsIntoClass(Klass)

    const Connect = connect(
      mapStateToPropsCreator(input),
      mapDispatchToPropsCreator(input)
    )(Klass)

    if (mustWrapTheWrapper) {
      return function Kea (props) {
        // attach the reducer to redux before handing it over to react-redux
        convertInputToLogic({ input, props })
        return <Connect {...props} />
      }
    } else {
      return Connect
    }
  }

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

export function resetKeaLogicCache () {
  clearLogicCache()
}
