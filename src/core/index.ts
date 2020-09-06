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
import { createEvents } from './steps/events'
import { KeaPlugin } from '../types'

// core plugin
export const corePlugin: KeaPlugin = {
  name: 'core',

  defaults: () => ({
    cache: {},
    connections: {},
    constants: {},
    actionCreators: {},
    actionKeys: {},
    actionTypes: {},
    actions: {},
    defaults: {},
    reducers: {},
    reducerOptions: {},
    reducer: undefined,
    selector: undefined,
    selectors: {},
    values: {},
    propTypes: {},
    events: {},
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
    values: createValues,
    events: createEvents,
  },
}
