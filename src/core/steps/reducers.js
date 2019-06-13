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
      const initialValue = s[0]
      const reducer = s[s.length - 1]
      const type = typeof s[1] === 'function' ? s[1] : undefined
      const options = typeof s[s.length - 2] === 'object' ? s[s.length - 2] : undefined

      let value

      // if we have a previously provided default value, use it
      if (typeof logic.defaults[key] !== 'undefined') {
        value = logic.defaults[key]
      } else {
        // there is a root default selector. use it and try to get the key, fallback to initialValue
        if (typeof logic.defaults['*'] === 'function') {
          value = (state, props) => {
            const v = logic.defaults['*'](state, props)[key]
            return typeof v === 'undefined' ? initialValue : typeof v === 'function' ? v(state, props) : v
          }
        } else {
          value = initialValue
        }

        // save the given value as default if nothing else was given
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
            console.error(`[KEA] Store not initialized and can't get default value of "${key}" in "${logic.pathString}"`)
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
