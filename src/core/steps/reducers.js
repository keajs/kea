import { getReduxStore } from '../../cache'

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
      }

      // if the value is a selector, select with it
      if (typeof value === 'function') {
        const store = getReduxStore()
        if (store && store.getState) {
          value = value(store && store.getState(), logic && logic.props)
        } else {
          console.error(`[KEA] Can not use default selector for reducer ${key} in ${logic.path.join('.')} before connecting to store`)
        }
      }

      // save as the default if nothing else is there
      if (typeof logic.defaults[key] === 'undefined') {
        logic.defaults[key] = value
      }
      if (type) {
        logic.propTypes[key] = type
      }
      if (options) {
        logic.reducerOptions[key] = options
      }

      logic.reducers[key] = typeof reducer === 'function' ? reducer : createMappingReducer(reducer, value)

      warnIfUndefinedActionCreator(logic.reducers, key)
    }
  }
}

function warnIfUndefinedActionCreator (object, property) {
  if (process.env.NODE_ENV !== 'production') {
    if (object.undefined !== undefined) {
      console.warn(`A reducer with the property "${property}" is waiting for an action where its key is not defined.`)
    }
  }
}

// create reducer function from such an object { [action]: (state, payload) => state }
function createMappingReducer (mapping, defaultValue) {
  return (state = defaultValue, action) => {
    if (mapping[action.type]) {
      return mapping[action.type](state, action.payload, action.meta)
    } else {
      return state
    }
  }
}
