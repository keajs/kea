import { createPropTransforms, propTypesFromMapping } from './props'
import { createActionTransforms } from './actions'
import { connect as reduxConnect } from 'react-redux'

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

  return reduxConnect(propTransforms.selectors, actionTransforms.actions, actionMerge)
}

export function connect (mapping) {
  return function (Klass) {
    if (mapping.props) {
      Klass.propTypes = Object.assign({}, propTypesFromMapping(mapping), Klass.propTypes || {})
    }

    // convert this.props.actions to this.actions
    const originalComponentWillMount = Klass.prototype.componentWillMount
    Klass.prototype.componentWillMount = function () {
      this.actions = this.props.actions
      originalComponentWillMount && originalComponentWillMount.bind(this)()
    }

    return connectMapping(mapping)(Klass)
  }
}
