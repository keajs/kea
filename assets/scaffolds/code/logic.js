import { PropTypes } from 'react'
import Logic, { createMapping } from 'kea/logic'
import mirrorCreator from 'mirror-creator'

// const outerActions = selectActionsFromLogic([
//   otherScene, [
//     'doSomething'
//   ]
// ])

class $$CapitalComponent$$Logic extends Logic {
  // PATH
  path = () => ['scenes', '$$camelScene$$', '$$camelComponent$$']

  // CONSTANTS
  constants = () => mirrorCreator([
    // 'SHOW_ALL',
    // 'SHOW_ACTIVE',
    // 'SHOW_COMPLETED'
  ])

  // ACTIONS
  actions = ({ constants }) => ({
    // showAll: true,
    // setVisibilityFilter: filter => ({ filter }),
  })

  // STRUCTURE
  structure = ({ actions, constants }) => ({
    // visibilityFilter: createMapping({
    //   [actions.showAll]: () => constants.SHOW_ALL,
    //   [actions.setVisibilityFilter]: (_, payload) => payload.filter
    //   [outerActions.doSomething]: (state, payload) => payload.keep ? state : payload.new
    // }, constants.SHOW_ALL, PropTypes.string)
  })

  // SELECTORS (data from reducer + more)
  selectors = ({ path, structure, constants, selectors, addSelector }) => {
    // addSelector('todoCount', PropTypes.number, [
    //   selectors.todos
    // ], (todos) => {
    //   return todos.length
    // })
  }
}

export default new $$CapitalComponent$$Logic().init()
