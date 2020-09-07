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
import { Logic, LogicInput, ReducerFunction } from '../../types'
import { AnyAction } from 'redux'

export function createReducers(logic: Logic, input: LogicInput): void {
  if (!input.reducers) {
    return
  }

  const reducers = typeof input.reducers === 'function' ? input.reducers(logic) : input.reducers

  const keys = Object.keys(reducers)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const object = reducers[key]

    let initialValue: any
    let reducer
    let type
    let options

    if (Array.isArray(object)) {
      // s = [ value, (type), (options), reducer ]
      initialValue = object[0]
      reducer = object[object.length - 1]
      type = typeof object[1] === 'function' ? object[1] : undefined
      if (typeof object[object.length - 2] === 'object') {
        options = object[object.length - 2]
      }
    } else if (typeof object === 'function' || typeof object === 'object') {
      initialValue = null
      reducer = object
    } else {
      throw new Error(`[KEA] Logic "${logic.pathString}" reducer "${key}" is set to unsupported value`)
    }

    // if we have a previously provided default value, use it
    if (typeof logic.defaults[key] === 'undefined') {
      // there is a root default selector. use it and try to get the key, fallback to initialValue
      if (typeof logic.defaults['*'] === 'function') {
        logic.defaults[key] = (state: any, props: any) => {
          const v = logic.defaults['*'](state, props)[key]
          return typeof v === 'undefined' ? initialValue : typeof v === 'function' ? v(state, props) : v
        }
      } else {
        logic.defaults[key] = initialValue
      }
    }

    if (type) {
      logic.propTypes[key] = type
    }

    if (!logic.reducerOptions[key]) {
      logic.reducerOptions[key] = {}
    }

    if (options) {
      Object.assign(logic.reducerOptions[key], options)
    }

    if (!logic.cache.reducers) {
      logic.cache.reducers = {}
    }

    if (!logic.cache.reducers[key] || (options && options.replace)) {
      logic.cache.reducers[key] = { functions: [], mapping: {} }
    }

    const cache = logic.cache.reducers[key]

    if (typeof reducer === 'function') {
      cache.functions.push(reducer)
    } else if (reducer) {
      const mappingKeys = Object.keys(reducer)
      for (let i = 0; i < mappingKeys.length; i++) {
        const mappingKey = logic.actions[mappingKeys[i]] ? logic.actions[mappingKeys[i]].toString() : mappingKeys[i]
        cache.mapping[mappingKey] = reducer[mappingKeys[i]]
      }
    }

    const funReducer = createFunctionReducer(cache.functions, logic.defaults[key], key, logic)
    const mapReducer = createMappingReducer(cache.mapping, logic.defaults[key], key, logic)

    const newReducer =
      funReducer && mapReducer
        ? (state: any, action: AnyAction, fullState: any) =>
            mapReducer(funReducer(state, action, fullState), action, fullState)
        : mapReducer || funReducer

    logic.reducers[key] = newReducer || (() => logic.defaults[key])
  }
}

function createFunctionReducer(functions: ReducerFunction[], defaultValue: any, key: string, logic: Logic) {
  if (functions.length === 0) {
    return null
  }

  return (state: any, action: AnyAction, fullState: any) => {
    if (typeof state === 'undefined') {
      state = getDefaultState(defaultValue, fullState, key, logic)
    }

    return functions.reduce((accumulatedState, reducer) => reducer(accumulatedState, action, fullState), state)
  }
}

// create reducer function from such an object { [action]: (state, payload) => state }
function createMappingReducer(
  mapping: Record<string, (state: any, payload: any, meta?: any) => any>,
  defaultValue: any,
  key: string,
  logic: Logic,
) {
  if (Object.keys(mapping).length === 0) {
    return null
  }

  if (process.env.NODE_ENV !== 'production') {
    if (typeof mapping.undefined !== 'undefined') {
      throw new Error(
        `[KEA] Logic "${logic.pathString}" reducer "${key}" is waiting for an action that is undefined: [${Object.keys(
          mapping,
        ).join(', ')}]`,
      )
    }
  }

  return (state: any, action: AnyAction, fullState: any) => {
    if (typeof state === 'undefined') {
      state = getDefaultState(defaultValue, fullState, key, logic)
    }

    if (mapping[action.type]) {
      return mapping[action.type](state, action.payload, action.meta)
    } else {
      return state
    }
  }
}

function getDefaultState(defaultValue: any, fullState: any, key: any, logic: Logic) {
  if (typeof defaultValue === 'function') {
    if (fullState) {
      return defaultValue(fullState, logic.props)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[KEA] Store not initialized and can't get default value of "${key}" in "${logic.pathString}"`)
      }
      return undefined
    }
  }
  return defaultValue
}
