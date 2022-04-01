import {ActionDefinitions, Logic, ReducerDefinitions} from "../types";
import {createAction} from "../core/shared/actions";
import {createActionType} from "../core/steps/action-creators";
import {getContext} from "../context";
import {LogicBuilder} from "./index";
import {createDefaults} from "../core/steps/defaults";
import {createReducers} from "../core/steps/reducers";
import {createReducerSelectors} from "../core/steps/reducer-selectors";
import {createValues} from "../core/steps/values";

export function action<L extends Logic = Logic>(
  key: string, payloadCreator: any
): LogicBuilder<L> {
  return (logic) => {
      const actionCreator =
        typeof payloadCreator === 'function' && payloadCreator._isKeaAction
          ? payloadCreator
          : createAction(createActionType(key, logic.pathString), payloadCreator)
      const type = actionCreator.toString()

      logic.actionCreators[key] = actionCreator
      logic.actions[key] = (...inp: any[]) => {
        const builtAction = actionCreator(...inp)
        getContext().store.dispatch(builtAction)
      }
      logic.actions[key].toString = () => type
      logic.actionKeys[type] = key
      logic.actionTypes[key] = type
  }
}

export function actions<L extends Logic = Logic>(
  actions: ActionDefinitions<L>
): LogicBuilder<L> {
  return (logic) => {
    for (const key of Object.keys(actions)) {
      action(key, actions[key])(logic)
    }
  }
}

export function defaults<L extends Logic = Logic>(
  input: ReducerDefinitions<L> | ((logic: L) => ReducerDefinitions<L>),
): LogicBuilder<L> {
  return (logic) => {
    const defaults = typeof input === 'function' ? input(logic) : input
    createDefaults(logic, { defaults })
  }
}

export function reducers<L extends Logic = Logic>(
  input: ReducerDefinitions<L> | ((logic: L) => ReducerDefinitions<L>),
): LogicBuilder<L> {
  return (logic) => {
    const reducers = typeof input === 'function' ? input(logic) : input
    createReducers(logic, { reducers })
    createReducerSelectors(logic, {})
    createValues(logic, {})
  }
}
