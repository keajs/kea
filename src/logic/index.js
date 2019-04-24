import { createConnect, addConnection } from './connect'
import { createConstants } from './constants'
import { createActions } from './actions'
import { createReducerInputs, createReducers } from './reducers'
import { createSelectors, createReducerSelectors } from './selectors'

import { runPlugins } from '../plugins'
import { attachReducer } from '../store/reducer'

let inputPathCreators = new WeakMap()
let globalInputCounter = 0

let logicCache = {}

export function clearLogicCache () {
  inputPathCreators = new WeakMap()
  globalInputCounter = 0

  logicCache = {}
}

export function convertInputToLogic ({ input, key: inputKey, props, plugins, connectToStore = true }) {
  const key = inputKey || (props && input.key ? input.key(props) : null)

  if (!key && input.key) {
    throw new Error('Must have key')
  }

  const path = getPathForInput(input, key)
  const pathString = path.join('.')

  if (!logicCache[pathString]) {
    const output = convertInputWithPath({ input, key, path, plugins, props })

    logicCache[pathString] = output

    if (connectToStore && output.reducer) {
      attachReducer(output.path, output.reducer)
    }
  } else {
    enhanceExistingLogic(logicCache[pathString], { props })
  }

  return logicCache[pathString]
}

function enhanceExistingLogic (output, { props }) {
  output.props = props
}

export function convertPartialDynamicInput ({ input, plugins }) {
  let output = {
    constants: {}
  }

  createConstants(input, output)
  runPlugins(plugins, 'afterConstants', input, output)

  return output
}

// Converts `input` into `logic`.
function convertInputWithPath ({ input, key, path, plugins, props }) {
  // We will start with an object like this and extend it as we go along.
  // In the end this object will be returned as `const logic = kea(input)`
  let logic = {
    key,
    path,
    plugins,
    props,
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

  // Let's call all plugins that want to hook into this moment.
  runPlugins(plugins, 'beforeCreate', input, logic)

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
  createConnect(input, logic)
  runPlugins(plugins, 'afterConnect', input, logic, addConnection)

  /*
    Convert any requested constants to objects that can be destructured

    input.constants = ['SOMETHING', 'CONSTANT_NAME']

    ... converts to:

    logic.constants = { SOMETHING: 'SOMETHING', CONSTANT_NAME: 'CONSTANT_NAME' }
  */
  createConstants(input, logic)
  runPlugins(plugins, 'afterConstants', input, logic)

  /*
    input.actions = ({ path, constants }) => ({
      setDuckId: (duckId) => ({ duckId })
    })

    ... converts to:

    logic.actions == {
      setDuckId: (duckId) => ({ type: 'set duck (...)', payload: { duckId } }),
    }
  */
  createActions(input, logic)
  runPlugins(plugins, 'afterActions', input, logic)

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
  createReducerInputs(input, logic)
  runPlugins(plugins, 'afterReducerInputs', input, logic)

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
  createReducers(input, logic)
  runPlugins(plugins, 'afterReducers', input, logic)

  /*
    logic.reducers = { duckId: function () {} }

    ... converts to

    logic.selectors = { duckId: (state) => state.scenes.ducks.duckId } // memoized via reselect
  */
  createReducerSelectors(input, logic)
  runPlugins(plugins, 'afterReducerSelectors', input, logic)

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
  createSelectors(input, logic)
  runPlugins(plugins, 'afterSelectors', input, logic)

  /*
    add a connection to ourselves in the end
    logic.connections = { ...logic.connections, 'scenes.path.to.logic': logic }
  */
  logic.connections[path.join('.')] = logic
  runPlugins(plugins, 'afterCreate', input, logic)

  return logic
}

function getPathForInput (input, key) {
  if (input.path) {
    return input.path(key)
  }

  let pathCreator = inputPathCreators.get(input)

  if (pathCreator) {
    return pathCreator(key)
  }

  const count = (++globalInputCounter).toString()

  if (key) {
    pathCreator = (key) => ['kea', 'inline', count, key]
  } else {
    pathCreator = () => ['kea', 'inline', count]
  }

  inputPathCreators.set(input, pathCreator)

  return pathCreator(key)
}
