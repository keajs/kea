import { createConnect } from './steps/connect'
import { createConstants } from './steps/constants'
import { createActions } from './steps/actions'
import { createDefaults } from './steps/defaults'
import { createReducers } from './steps/reducers'
import { createReducer } from './steps/reducer'
import { createReducerSelectors } from './steps/reducer-selectors'
import { createSelectors } from './steps/selectors'

// core plugin
export default {
  name: 'core',

  defaults: () => ({
    connections: {},
    constants: {},
    actions: {},
    defaults: {},
    reducers: {},
    reducerOptions: {},
    reducer: undefined,
    selectors: {},
    propTypes: {}
  }),

  steps: {
    connect: createConnect,
    constants: createConstants,
    actions: createActions,
    defaults: createDefaults,
    reducers: createReducers,
    reducer: createReducer,
    reducerSelectors: createReducerSelectors,
    selectors: createSelectors
  }
}
