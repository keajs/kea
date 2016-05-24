import { selectPropsFromLogic } from './props'
import { actionMerge, selectActionsFromLogic } from './actions'
import { connect } from 'react-redux'

export function connectMapping (mapping) {
  const actionSelector = selectActionsFromLogic(mapping.actions)
  const propSelector = selectPropsFromLogic(mapping.props)
  return connect(propSelector, actionSelector, actionMerge)
}
