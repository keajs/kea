import { createPropTransforms } from './props'
import { createActionTransforms } from './actions'
import { connect } from 'react-redux'

export function connectMapping (mapping) {
  const actionTransforms = createActionTransforms(mapping.actions)
  const propTransforms = createPropTransforms(mapping.props)

  const actionMerge = function (stateProps, dispatchProps, ownProps) {
    let props = Object.assign({}, ownProps, stateProps)
    let actions = Object.assign({}, dispatchProps)

    Object.keys(propTransforms.transforms).forEach(key => {
      props[key] = propTransforms.transforms[key](stateProps[key], ownProps)
    })

    Object.keys(actionTransforms.transforms).forEach(key => {
      const newArgs = actionTransforms.transforms[key].map(k => ownProps[k])
      actions[key] = function (...args) {
        const allArgs = [...newArgs, ...args]
        return dispatchProps[key](...allArgs)
      }
    })

    return Object.assign({}, props, { actions })
  }

  return connect(propTransforms.selectors, actionTransforms.actions, actionMerge)
}
