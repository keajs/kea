import { addActions, addConstants, addReducers, addSelectors } from '../dsl'

export const convertLogic = input => logic => {
  if (input.constants) {
    addConstants(input.constants(logic))
  }
  if (input.actions) {
    addActions(input.actions(logic))
  }
  if (input.reducers) {
    addReducers(input.reducers(logic))
  }
  if (input.selectors) {
    addSelectors(input.selectors(logic))
  }
}
