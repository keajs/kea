import PropTypes from 'prop-types'

import { safePathSelector } from './selectors'
import { addReducer } from './reducer'
import { deconstructMapping } from './mapping'

export function selectPropsFromLogic (propsMapping = []) {
  const propsArray = deconstructMapping(propsMapping)

  if (!propsArray) {
    return
  }

  let hash = {}

  propsArray.forEach(([logic, from, to]) => {
    // we were given a function (state) => state.something as logic input
    let isFunction = (typeof logic === 'function') && !logic._isKeaFunction

    // path selector array
    if (Array.isArray(logic)) {
      logic = state => safePathSelector(logic, state)
      isFunction = true
    }

    if (logic._isKeaSingleton) {
      if (!logic._keaReducerConnected) {
        addReducer(logic.path, logic.reducer, true)
        logic._keaReducerConnected = true
      }
    }

    const selectors = isFunction ? null : (logic.selectors ? logic.selectors : logic)

    if (from === '*') {
      hash[to] = isFunction ? logic : (logic.selector ? logic.selector : selectors)
    } else if (isFunction) {
      hash[to] = (state) => (logic(state) || {})[from]
    } else if (typeof selectors[from] !== 'undefined') {
      hash[to] = selectors[from]
    } else {
      console.error(`[KEA-LOGIC] selector "${from}" missing for logic:`, logic)
      console.trace()
    }
  })

  return hash
}

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

function havePropsChangedDebug (nextProps) {
  const changedProps = Object.keys(nextProps).filter(key => key !== 'actions' && nextProps[key] !== this.props[key])
  if (changedProps.length > 0) {
    changedProps.forEach(key => {
      console.log(`prop '${key}' changed`, this.props[key], nextProps[key])
    })
    return true
  }
  return false
}

function havePropsChangedProduction (nextProps) {
  for (var key in nextProps) {
    if (key === 'actions') {
      continue
    }
    if (nextProps[key] !== this.props[key]) {
      return true
    }
  }
  return false
}

export function havePropsChanged (debug = false) {
  if (debug) {
    return havePropsChangedDebug
  } else {
    return havePropsChangedProduction
  }
}
