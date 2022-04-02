import * as React from 'react'
import { useEffect, useRef } from 'react'
import { connect as reduxConnect } from 'react-redux'

import { runPlugins } from '../kea/plugins'
import { AnyComponent, KeaComponent, Logic, LogicWrapper, Props } from '../types'
import { getCachedBuiltLogic } from '../kea/build'

export function wrapComponent<L extends Logic = Logic>(
  Component: AnyComponent,
  wrapper: LogicWrapper<L>,
): KeaComponent {
  runPlugins('beforeWrap', wrapper, Component)

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
      const oldLogic = getCachedBuiltLogic(wrapper, props)
      if (oldLogic?.pathString && isUnmounting[oldLogic.pathString]) {
        return lastState[oldLogic.pathString]
      }

      const logic = wrapper.build(props)

      const resp = {} as Record<string, any>
      Object.entries(logic.selectors).forEach(([key, selector]) => {
        resp[key] = selector(state, props)
      })

      lastState[logic.pathString] = resp

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

  const Kea: KeaComponent = function (props: Props) {
    const logic = wrapper.build(props)
    const pathString = useRef(logic.pathString)

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

  runPlugins('afterWrap', wrapper, Component, Kea)
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
