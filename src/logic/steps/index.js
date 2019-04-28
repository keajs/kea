import { createConnect } from './connect'
import { createConstants } from './constants'
import { createActions } from './actions'
import { createDefaults } from './defaults'
import { createReducers } from './reducers'
import { createReducer } from './reducer'
import { createReducerSelectors } from './reducer-selectors'
import { createSelectors } from './selectors'

export function getDefaultSteps () {
  return {
    connect: [createConnect],
    constants: [createConstants],
    actions: [createActions],
    defaults: [createDefaults],
    reducers: [createReducers],
    reducer: [createReducer],
    reducerSelectors: [createReducerSelectors],
    selectors: [createSelectors]
  }
}
