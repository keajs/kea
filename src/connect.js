import { createPropTransforms } from './props'
import { selectActionsFromLogic } from './actions'
import { connect } from 'react-redux'

export function connectMapping (mapping) {
  const actionSelector = selectActionsFromLogic(mapping.actions)
  const propTransforms = createPropTransforms(mapping.props)

  const actionMerge = function (stateProps, dispatchProps, ownProps) {
    let newState = {}

    Object.keys(propTransforms.transforms).forEach(key => {
      newState[key] = propTransforms.transforms[key](stateProps[key], ownProps)
    })

    return Object.assign({}, ownProps, stateProps, newState, {actions: dispatchProps})
  }

  return connect(propTransforms.selectors, actionSelector, actionMerge)
}
