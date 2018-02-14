import PropTypes from 'prop-types'

import { deconstructMapping } from './mapping'

export function propTypesFromConnect (mapping, extra = null) {
  let propTypes = Object.assign({}, mapping.propTypes || mapping.passedProps || {})

  if (mapping.props) {
    const { response: propsArray } = deconstructMapping(mapping.props)

    if (!propsArray) {
      return
    }

    propsArray.forEach(([logic, from, to]) => {
      if (logic && logic.propTypes) {
        const propType = logic.propTypes[from]

        if (propType) {
          propTypes[to] = propType
        } else if (from !== '*') {
          console.error(`[KEA-LOGIC] prop type for "${from}" missing for logic:`, logic)
          console.trace()
        }
      }
    })
  }

  if (mapping.actions) {
    const { response: actionsArray } = deconstructMapping(mapping.actions)

    if (!actionsArray) {
      return
    }

    propTypes.actions = {}

    actionsArray.forEach(([logic, from, to]) => {
      const actions = logic && logic.actions ? logic.actions : logic

      if (actions[from]) {
        propTypes.actions[to] = PropTypes.func
      } else {
        console.error(`[KEA-LOGIC] action "${from}" missing for logic:`, logic)
        console.trace()
      }
    })

    propTypes.actions = PropTypes.shape(propTypes.actions)
  }

  if (extra) {
    Object.assign(propTypes, extra)
  }

  return propTypes
}
