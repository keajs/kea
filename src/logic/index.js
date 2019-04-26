import { createConnect, addConnection } from './connect'
import { createConstants } from './constants'
import { createActions } from './actions'
import { createReducerInputs } from './reducer-inputs'
import { createReducers } from './reducers'
import { createSelectors, createReducerSelectors } from './selectors'

import { getCache } from '../cache'
import { runPlugins } from '../plugins'

export function convertInputToLogic ({ input, key: inputKey, props, plugins }) {
  const key = inputKey || (props && input.key ? input.key(props) : null)

  if (!key && input.key) {
    throw new Error('Must have key')
  }

  const path = getPathForInput(input, key)
  const pathString = path.join('.')

  const { logicCache } = getCache()

  if (!logicCache[pathString]) {
    let logic = createBlankLogic({ key, path, plugins, props })
    applyInputToLogic(logic, input)

    input.merge && input.merge.forEach(merge => applyInputToLogic(logic, merge))

    logicCache[pathString] = logic
  } else {
    enhanceExistingLogic(logicCache[pathString], { props })
  }

  return logicCache[pathString]
}

export function convertPartialDynamicInput ({ input, plugins }) {
  let logic = {
    plugins: plugins,
    constants: {}
  }

  createConstants(logic, input)
  runPlugins(logic.plugins, 'afterConstants', logic, input)

  return logic
}

function createBlankLogic ({ key, path, plugins, props }) {
  return {
    key,
    path,
    plugins,
    props,
    mounted: false,
    connections: {},
    constants: {},
    actions: {},
    reducerInputs: {},
    reducers: {},
    reducer: undefined,
    defaults: {}, // do we need this? it can be taken from reducerInputs easily
    selectors: {},
    propTypes: {}
  }
}

function enhanceExistingLogic (logic, { props }) {
  logic.props = props
}

// Converts `input` into `logic`.
function applyInputToLogic (logic, input) {
  // We will start with an object like this and extend it as we go along.
  // In the end this object will be returned as `const logic = kea(input)`
  // let logic = createBlankLogic({ key, path, plugins, props })

  // Let's call all plugins that want to hook into this moment.
  runPlugins(logic.plugins, 'beforeCreate', logic, input)

  /*
    Copy the connect'ed logic stores' selectors and actions into this object

    input.connect = {
      props: [farmSceneLogic, ['chicken']],
      actions: [farmSceneLogic, ['setChicken']]
    }

    ... converts to:

    logic.connections = { 'scenes.farm': farmSceneLogic }
    logic.actions = { setChicken: (id) => ({ type: 'set chicken (farm)', payload: { id } } }) }
    logic.selectors = { chicken: (state) => state.scenes.farm }

    // TODO: should we rename connect.props to connect.selectors ?
  */
  createConnect(logic, input)
  runPlugins(logic.plugins, 'afterConnect', logic, input, addConnection)

  /*
    Convert any requested constants to objects that can be destructured

    input.constants = ['SOMETHING', 'CONSTANT_NAME']

    ... converts to:

    logic.constants = { SOMETHING: 'SOMETHING', CONSTANT_NAME: 'CONSTANT_NAME' }
  */
  createConstants(logic, input)
  runPlugins(logic.plugins, 'afterConstants', logic, input)

  /*
    input.actions = ({ path, constants }) => ({
      setDuckId: (duckId) => ({ duckId })
    })

    ... converts to:

    logic.actions == {
      setDuckId: (duckId) => ({ type: 'set duck (...)', payload: { duckId } }),
    }
  */
  createActions(logic, input)
  runPlugins(logic.plugins, 'afterActions', logic, input)

  /*
    input.reducers = ({ actions, path, constants }) => ({
      duckId: [10, PropTypes.number, { persist: true }, {
        [actions.setDuckId]: (_, payload) => payload.duckId
      }]
    })

    ... converts to:

    logic.reducerInputs = {
      duckId: {
        value: 10,
        type: PropTypes.number,
        reducer: (state = 10, action) => action.type == actions.setDuckId.toString() ? action.payload.duckId : state,
        options: { persist: true }
      }
    }
  */
  createReducerInputs(logic, input)
  runPlugins(logic.plugins, 'afterReducerInputs', logic, input)

  /*
    logic.reducerInputs = {
      duckId: {
        value: 10,
        type: PropTypes.number,
        reducer: (state = 10, action) => action.type == actions.setDuckId.toString() ? action.payload.duckId : state,
        options: { persist: true }
      }
    }

    ... converts to:

    logic.propTypes = { duckId: PropTypes.number }
    logic.defaults = { duckId: 10 }
    logic.reducers = { duckId: function () {} }
    logic.reducer = combineReducers(logic.reducers)
  */
  createReducers(logic, input)
  runPlugins(logic.plugins, 'afterReducers', logic, input)

  /*
    logic.reducers = { duckId: function () {} }

    ... converts to

    logic.selectors = { duckId: (state) => state.scenes.ducks.duckId } // memoized via reselect
  */
  createReducerSelectors(logic, input)
  runPlugins(logic.plugins, 'afterReducerSelectors', logic, input)

  /*
    input.selectors = ({ selectors }) => ({
      duckAndChicken: [
        () => [selectors.duckId, selectors.chickenId],
        (duckId, chickenId) => duckId + chickenId,
        PropType.number
      ],
    })

    ... converts to

    logic.selector = state => state.scenes.farm // memoized via reselect
    logic.selectors = {
      duckAndChicken: state => logic.selector(state).duckAndChicken // memoized via reselect
    }
  */
  createSelectors(logic, input)
  runPlugins(logic.plugins, 'afterSelectors', logic, input)

  /*
    add a connection to ourselves in the end
    logic.connections = { ...logic.connections, 'scenes.path.to.logic': logic }
  */
  logic.connections[logic.path.join('.')] = logic
  runPlugins(logic.plugins, 'afterCreate', logic, input)

  return logic
}

function getPathForInput (input, key) {
  if (input.path) {
    return input.path(key)
  }

  const { inputPathCreators } = getCache()

  let pathCreator = inputPathCreators.get(input)

  if (pathCreator) {
    return pathCreator(key)
  }

  const count = (++getCache().globalInputCounter).toString()

  if (key) {
    pathCreator = (key) => ['kea', 'inline', count, key]
  } else {
    pathCreator = () => ['kea', 'inline', count]
  }

  inputPathCreators.set(input, pathCreator)

  return pathCreator(key)
}
