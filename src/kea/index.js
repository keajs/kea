import React, { useEffect, useRef } from 'react'
import { connect as reduxConnect } from 'react-redux'

import { buildLogic, convertPartialDynamicInput, getIdForInput } from '../logic'
import { getContext } from '../context'

import { getLocalPlugins, runPlugins, reservedProxiedKeys } from '../plugins'

import { mountPaths, unmountPaths } from './mount'

function createWrapperFunction (input) {
  const wrapper = (Klass) => {
    const plugins = getLocalPlugins(input)

    runPlugins(plugins, 'beforeWrapper', input, Klass)

    // make this.actions work if it's a React.Component we're operating with
    injectActionsIntoClass(Klass)

    let isUnmounting = false
    let lastState

    const createConnect = reduxConnect(
      (state, ownProps) => {
        // At the moment when we unmount and detach from redux, react-redux will still be subscribed to the store
        // and will run this function to see if anything changed. Since we are detached from the store, all
        // selectors of this logic will crash. To avoid this, cache and return the last state.
        // Nothing will be rendered anywa.
        if (isUnmounting) {
          return lastState
        }

        // TODO: any better way to get it?
        const logic = buildLogic({ input, props: ownProps })

        let resp = {}
        Object.entries(logic.selectors).forEach(([key, selector]) => {
          resp[key] = selector(state, ownProps)
        })

        lastState = resp

        return resp
      },
      (dispatch, ownProps) => {
        // TODO: any better way to get it?
        const logic = buildLogic({ input, props: ownProps })

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
      const logic = buildLogic({ input, props, extendedInputs: wrapper._extendWith })

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
        isUnmounting = true
        unmountPaths(logic, plugins)
        isUnmounting = false
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

export function kea (input) {
  const id = getIdForInput(input)
  getContext().inputs[id] = input

  const wrapper = createWrapperFunction(input)

  // TODO: legacy names. remove/change them?
  wrapper._isKeaFunction = true
  wrapper._isKeaSingleton = !input.key

  wrapper._extendWith = []
  wrapper.extend = (extendedInput) => {
    if (!input.key && !wrapper.mustBuild()) {
      throw new Error('[KEA] Can not extend logic once it has been built!')
    }
    wrapper._extendWith.push(extendedInput)
    return wrapper
  }

  if (input.key) {
    wrapper.withKey = keyCreator => {
      if (typeof keyCreator === 'function') {
        const buildWithProps = props => buildLogic({ input, key: keyCreator(props), props, extendedInputs: wrapper._extendWith })
        buildWithProps._isKeaWithKey = true
        return buildWithProps
      } else {
        return wrapper.buildWithKey(keyCreator)
      }
    }

    wrapper.buildWithKey = (key) => buildLogic({ input, key, extendedInputs: wrapper._extendWith })

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

      const logic = buildLogic({ input, extendedInputs: wrapper._extendWith })

      state[id] = state[id] ? { ...state[id], logic } : { logic }

      return logic
    }

    wrapper.mount = () => {
      const logic = wrapper.build()
      const plugins = getLocalPlugins(input)

      mountPaths(logic, plugins)
      return () => unmountPaths(logic, plugins)
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
