import { PropTypes } from 'react'
import { createStructuredSelector } from 'reselect'

export function selectPropsFromLogic (mapping = []) {
  if (mapping.length % 2 === 1) {
    console.error('[KEA-LOGIC] uneven mapping given to selectPropsFromLogic:', mapping)
    console.trace()
    return
  }

  let hash = {}

  for (let i = 0; i < mapping.length; i += 2) {
    const logic = mapping[i]
    const props = mapping[i + 1]

    // we were given a function (state) => state.something as logic input
    const isFunction = typeof logic === 'function'

    const selectors = isFunction ? null : (logic.selectors ? logic.selectors : logic)

    props.forEach(query => {
      let from = query
      let to = query

      if (query.includes(' as ')) {
        [from, to] = query.split(' as ')
      }

      if (from === '*') {
        hash[to] = isFunction ? logic : (logic.selector ? logic.selector : selectors)
      } else if (isFunction) {
        hash[to] = (state) => logic(state)[from]
      } else if (typeof selectors[from] !== 'undefined') {
        hash[to] = selectors[from]
      } else {
        console.error(`[KEA-LOGIC] selector "${query}" missing for logic:`, logic)
        console.trace()
      }
    })
  }

  return createStructuredSelector(hash)
}

export function propTypesFromMapping (mapping) {
  let propTypes = {}

  if (mapping.props) {
    if (mapping.props.length % 2 === 1) {
      console.error('[KEA-LOGIC] uneven props mapping given to propTypesFromLogic:', mapping)
      console.trace()
      return
    }
    for (let i = 0; i < mapping.props.length; i += 2) {
      const logic = mapping.props[i]
      const props = mapping.props[i + 1]

      props.forEach(query => {
        let from = query
        let to = query

        if (query.includes(' as ')) {
          [from, to] = query.split(' as ')
        }

        const structure = logic.structure[from]

        if (structure && structure.type) {
          propTypes[to] = structure.type
        } else {
          console.error(`[KEA-LOGIC] prop type "${query}" missing for logic:`, logic)
          console.trace()
        }
      })
    }
  }

  if (mapping.actions) {
    if (mapping.actions.length % 2 === 1) {
      console.error('[KEA-LOGIC] uneven actions mapping given to propTypesFromLogic:', mapping)
      console.trace()
      return
    }

    let actions = {}

    for (let i = 0; i < mapping.actions.length; i += 2) {
      const logic = mapping.actions[i]
      const actionsArray = mapping.actions[i + 1]

      const actions = logic && logic.actions ? logic.actions : logic

      actionsArray.forEach(query => {
        let from = query
        let to = query

        if (query.includes(' as ')) {
          [from, to] = query.split(' as ')
        }

        if (actions[from]) {
          propTypes[to] = PropTypes.func
        } else {
          console.error(`[KEA-LOGIC] action "${query}" missing for logic:`, logic)
          console.trace()
        }
      })
    }

    propTypes.actions = PropTypes.shape(actions)
  }

  return propTypes
}
