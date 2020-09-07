import * as React from 'react'
import { useEffect, useRef } from 'react'
import { connect as reduxConnect } from 'react-redux'

import { getPathStringForInput } from '../kea/path'
import { runPlugins } from '../plugins'
import { AnyComponent, KeaComponent, LogicWrapper, Props } from '../types'

export function wrapComponent(Component: AnyComponent, wrapper: LogicWrapper): KeaComponent {
  const { inputs } = wrapper
  const input = inputs[0]
  runPlugins('beforeWrapper', input, Component)

  // make this.actions work if it's a React.Component we're operating with
  injectActionsIntoClass(Component)

  const isUnmounting: Record<string, boolean> = {}
  const lastState: Record<string, any> = {}

  const createConnect = reduxConnect(
    (state, props: Props) => {
      // At the moment when we unmount and detach from redux, react-redux will still be subscribed to the store
      // and will run this function to see if anything changed. Since we are detached from the store, all
      // selectors of this logic will crash. To avoid this, cache and return the last state.
      // Nothing will be rendered anyway.
      const pathString = getPathStringForInput(input, props)

      if (isUnmounting[pathString]) {
        return lastState[pathString]
      }

      const logic = wrapper.build(props)

      const resp = {} as Record<string, any>
      Object.entries(logic.selectors).forEach(([key, selector]) => {
        resp[key] = selector(state, props)
      })

      lastState[pathString] = resp

      return resp
    },
    (dispatch, props: Props) => {
      const logic = wrapper.build(props)
      const actions = Object.assign({}, props.actions, logic.actions)

      return {
        dispatch: dispatch,
        actions: actions,
      }
    },
  )
  const Connect = createConnect(Component)

  // inject proptypes into the class if it's a React.Component
  // not using useRef here since we do it only once per component
  let injectPropTypes = !isStateless(Component)

  const Kea: KeaComponent = function (props: Props) {
    const logic = wrapper.build(props)
    const pathString = useRef(logic.pathString)

    // inject proptypes to React.Component
    if (injectPropTypes && logic.propTypes) {
      injectPropTypes = false
      Component.propTypes = Object.assign(Component.propTypes || {}, logic.propTypes)
    }

    // mount paths only on first render
    const unmount = useRef<() => void>()
    if (!unmount.current) {
      unmount.current = logic.mount()
    }

    // unmount paths when component gets removed
    useEffect(
      () => () => {
        // set this as mapStateToProps can still run even if we have detached from redux
        isUnmounting[pathString.current] = true
        unmount.current && unmount.current()
        delete isUnmounting[pathString.current]
        delete lastState[pathString.current]
      },
      [],
    )

    // unmount and remount if logic path changed
    if (pathString.current !== logic.pathString) {
      // set this as mapStateToProps can still run even if we have detached from redux
      isUnmounting[pathString.current] = true
      unmount.current()

      unmount.current = logic.mount()

      delete isUnmounting[pathString.current]
      delete lastState[pathString.current]

      pathString.current = logic.pathString
    }

    runPlugins('beforeRender', logic, props)
    return React.createElement(Connect, props)
  }

  Kea._wrapper = wrapper
  Kea._wrappedComponent = Component

  runPlugins('afterWrapper', input, Component, Kea)
  return Kea
}

function isStateless(Component: AnyComponent): boolean {
  return (
    typeof Component === 'function' && !(Component.prototype && Component.prototype.isReactComponent) // can be various things // native arrows don't have prototypes // special property
  )
}

// inject to the component something that converts this.props.actions to this.actions
function injectActionsIntoClass(Component: AnyComponent): void {
  if (!isStateless(Component)) {
    if (!Object.getOwnPropertyDescriptor(Component.prototype, 'actions')) {
      Object.defineProperty(Component.prototype, 'actions', {
        get: function actions() {
          return this.props.actions
        },
      })
    }
  }
}
