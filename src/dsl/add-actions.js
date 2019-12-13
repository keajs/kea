import { createAction } from '../core/shared/actions'
import { getContext } from '../index'

export function addActions (actionsToAdd) {
  const logic = getContext().build.building

  Object.keys(actionsToAdd).forEach(key => {
    if (typeof actionsToAdd[key] === 'function' && actionsToAdd[key]._isKeaAction) {
      logic.actionCreators[key] = actionsToAdd[key]
    } else {
      logic.actionCreators[key] = createAction(createActionType(key, logic.path), actionsToAdd[key])
    }

    const action = logic.actionCreators[key]
    logic.actions[key] = (...inp) => getContext().store.dispatch(action(...inp))
    logic.actions[key].toString = () => logic.actionCreators[key].toString()
  })
}

const toSpaces = (key) => key.replace(/(?:^|\.?)([A-Z])/g, (x, y) => ' ' + y.toLowerCase()).replace(/^ /, '')

export function createActionType (key, path) {
  // remove 'scenes.' from the path
  const pathString = (path[0] === 'scenes' ? path.slice(1) : path).join('.')
  return `${toSpaces(key)} (${pathString})`
}
