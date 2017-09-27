import PropTypes from 'prop-types'

import { addReducer } from '../reducer'
import { deconstructMapping } from './mapping'

export function propTypesFromMapping (mapping, extra = null) {
  let propTypes = Object.assign({}, mapping.propTypes || mapping.passedProps || {})

  if (mapping.props) {
    const propsArray = deconstructMapping(mapping.props)

    if (!propsArray) {
      return
    }

    propsArray.forEach(([logic, from, to]) => {
      if (logic._isKeaSingleton) {
        if (!logic._keaReducerConnected) {
          addReducer(logic.path, logic.reducer, true)
          logic._keaReducerConnected = true
        }
      }

      if (logic && logic.reducers) {
        const reducer = logic.reducers[from]

        if (reducer && reducer.type) {
          propTypes[to] = reducer.type
        } else if (from !== '*') {
          console.error(`[KEA-LOGIC] prop type for "${from}" missing for logic:`, logic)
          console.trace()
        }
      }
    })
  }

  if (mapping.actions) {
    const actionsArray = deconstructMapping(mapping.actions)

    if (!actionsArray) {
      return
    }

    propTypes.actions = {}

    actionsArray.forEach(([logic, from, to]) => {
      if (logic._isKeaSingleton) {
        if (!logic._keaReducerConnected) {
          addReducer(logic.path, logic.reducer, true)
          logic._keaReducerConnected = true
        }
      }

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
