import { createConnect } from './steps/connect'
import { createConstants } from './steps/constants'
import { createActionCreators } from './steps/action-creators'
import { createActions } from './steps/actions'
import { createDefaults } from './steps/defaults'
import { createReducers } from './steps/reducers'
import { createReducer } from './steps/reducer'
import { createReducerSelectors } from './steps/reducer-selectors'
import { createSelectors } from './steps/selectors'
import { createValues } from './steps/values'

// core plugin
export default {
  name: 'core',

  defaults: () => ({
    connections: {},
    constants: {},
    actionCreators: {},
    actions: {},
    defaults: {},
    reducers: {},
    reducerOptions: {},
    reducer: undefined,
    selector: undefined,
    selectors: {},
    values: {},
    propTypes: {}
  }),

  buildSteps: {
    connect: createConnect,
    constants: createConstants,
    actionCreators: createActionCreators,
    actions: createActions,
    defaults: createDefaults,
    reducers: createReducers,
    reducer: createReducer,
    reducerSelectors: createReducerSelectors,
    selectors: createSelectors,
    values: createValues
  }
}
