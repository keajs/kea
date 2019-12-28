import { addActions, addConnect, addConstants, addDefaults, addEvents, addReducers, addSelectors } from '../dsl'

export const convertLogic = input => logic => {
  input.connect && addConnect(typeof input.connect === 'function' ? input.connect(logic.props) : input.connect)
  input.constants && addConstants(input.constants(logic))
  input.actions && addActions(input.actions(logic))
  input.defaults && addDefaults(input.defaults)
  input.reducers && addReducers(input.reducers(logic))
  input.selectors && addSelectors(input.selectors(logic))
  input.events && addEvents(input.events(logic))
}
