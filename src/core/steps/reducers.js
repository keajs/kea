import { getReduxStore } from '../../cache/provider'

/*
  input.reducers = ({ actions, path, constants }) => ({
    duckId: [10, PropTypes.number, { persist: true }, {
      [actions.setDuckId]: (_, payload) => payload.duckId
    }]
  })

  ... converts to:

  logic.reducers = {
    duckId: function () {}
  },
  logic.propTypes = {
    duckId: PropTypes.number
  },
  logic.defaults = {
    duckId: 10
  }
*/
export function createReducers (logic, input) {
  if (!input.reducers) {
    return
  }

  const reducers = input.reducers(logic)

  const keys = Object.keys(reducers)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const s = reducers[key]
    if (Array.isArray(s)) {
      // s = [ value, (type), (options), reducer ]
      let value = s[0]
      const reducer = s[s.length - 1]
      const type = typeof s[1] === 'function' ? s[1] : undefined
      const options = typeof s[s.length - 2] === 'object' ? s[s.length - 2] : undefined

      // if we have a previously provided default value, use it
      if (typeof logic.defaults[key] !== 'undefined') {
        value = logic.defaults[key]
      } else {
      // save as the default if nothing else is there
        logic.defaults[key] = value
      }

      if (type) {
        logic.propTypes[key] = type
      }
      if (options) {
        logic.reducerOptions[key] = options
      }

      logic.reducers[key] = typeof reducer === 'function' ? reducer : createMappingReducer(reducer, value, key, logic)

      warnIfUndefinedActionCreator(logic.reducers, key)
    }
  }
}

function warnIfUndefinedActionCreator (object, property) {
  if (process.env.NODE_ENV !== 'production') {
    if (object.undefined !== undefined) {
      console.warn(`[KEA] A reducer with the property "${property}" is waiting for an action where its key is not defined.`)
    }
  }
}

// create reducer function from such an object { [action]: (state, payload) => state }
function createMappingReducer (mapping, defaultValue, key, logic) {
  return (state, action, fullState) => {
    if (typeof state === 'undefined') {
      state = defaultValue

      if (typeof state === 'function') {
        if (fullState) {
          state = defaultValue(fullState, logic.props)
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.error(`[KEA] Store not initialized and can't get default value of "${key}" in "${logic.path.join('.')}"`)
          }
          state = undefined
        }
      }
    }

    if (mapping[action.type]) {
      return mapping[action.type](state, action.payload, action.meta)
    } else {
      return state
    }
  }
}
