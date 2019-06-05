import React, { useEffect, useRef } from 'react'
import { connect as reduxConnect } from 'react-redux'

import { convertInputToLogic, convertPartialDynamicInput, getIdForInput } from '../logic'
import { getContext } from '../context'

import { getLocalPlugins, runPlugins, reservedProxiedKeys } from '../plugins'

import { mountPaths, unmountPaths } from './mount'

function createWrapperFunction (input) {
  const wrapper = (Klass) => {
    const plugins = getLocalPlugins(input)

    runPlugins(plugins, 'beforeWrapper', input, Klass)

    // make this.actions work if it's a React.Component we're operating with
    injectActionsIntoClass(Klass)

    if (getContext().debug) {
      console.log('running kea wrapper', getIdForInput(input))
    }

    const Connect = reduxConnect(
      mapStateToPropsCreator(input),
      mapDispatchToPropsCreator(input)
    )(Klass)

    // inject proptypes into the class if it's a React.Component
    // not using useRef here since we do it only once per component
    let injectPropTypes = !isStateless(Klass)

    const Kea = function (props) {
      if (getContext().debug) {
        console.log('running kea', getIdForInput(input))
      }
      const logic = convertInputToLogic({ input, props })

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
      useEffect(() => () => unmountPaths(logic, plugins), [])

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

export function kea (input) {
  const id = getIdForInput(input)
  getContext().inputs[id] = input

  const wrapper = createWrapperFunction(input)

  // TODO: legacy names. remove/change them?
  wrapper._isKeaFunction = true
  wrapper._isKeaSingleton = !input.key

  if (input.key) {
    wrapper.withKey = keyCreator => {
      if (typeof keyCreator === 'function') {
        const buildWithProps = props => convertInputToLogic({ input, key: keyCreator(props), props })
        buildWithProps._isKeaWithKey = true
        return buildWithProps
      } else {
        return wrapper.buildWithKey(keyCreator)
      }
    }

    wrapper.buildWithKey = (key) => convertInputToLogic({ input, key })

    wrapper.mountWithKey = (key) => {
      const plugins = getLocalPlugins(input)
      const logic = wrapper.buildWithKey(key)

      mountPaths(logic, plugins)
      return () => unmountPaths(logic, plugins)
    }

    Object.assign(wrapper, convertPartialDynamicInput({ input }))
  } else {
    const { proxyFields } = getContext()

    wrapper.mustBuild = () => {
      const { state } = getContext()
      const id = getIdForInput(input)

      return !state[id] || !state[id].logic
    }

    wrapper.build = (props) => {
      const { state } = getContext()
      const id = getIdForInput(input)

      if (state[id] && state[id].logic) {
        return state[id].logic
      }

      // console.log(`building ${id}`)
      const logic = convertInputToLogic({ input })
      state[id] = state[id] ? { ...state[id], logic } : { logic }

      return logic
    }

    wrapper.mount = () => {
      const logic = wrapper.build()
      const plugins = getLocalPlugins(input)

      mountPaths(logic, plugins)
      return () => unmountPaths(logic, plugins)
    }

    wrapper.extend = () => {
      if (!wrapper.mustBuild()) {
        throw new Error('[KEA] Can not extend logic once it has been built!')
      }
    }

    if (proxyFields) {
      const plugins = getLocalPlugins(input)
      const { logicKeys } = plugins
      for (const key of Object.keys(logicKeys)) {
        proxyFieldToLogic(wrapper, key)
      }
      for (const key of reservedProxiedKeys) {
        proxyFieldToLogic(wrapper, key)
      }
    }
  }

  if (getContext().autoMount && wrapper.mount) {
    wrapper.mount()
  }

  return wrapper
}

export function connect (input) {
  return kea({ connect: input })
}

const mapStateToPropsCreator = (input) => (state, ownProps) => {
  if (getContext().debug) {
    console.log('running mapStateToPropsCreator', getIdForInput(input))
  }
  const logic = convertInputToLogic({ input, props: ownProps })

  let resp = {}

  Object.entries(logic.selectors).forEach(([key, selector]) => {
    resp[key] = selector(state, ownProps)
  })

  return resp
}

const mapDispatchToPropsCreator = (input) => (dispatch, ownProps) => {
  if (getContext().debug) {
    console.log('running mapDispatchToPropsCreator', getIdForInput(input))
  }
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
    get: function actions () {
      return wrapper.build()[key]
    }
  })
}
