import {
  ActionCreatorForPayloadBuilder,
  ActionDefinitions,
  ActionForPayloadBuilder,
  BuiltLogic,
  CoreInput,
  Logic,
  LogicInput,
  LogicWrapper,
  ReducerDefinitions,
  SelectorDefinitions,
} from '../types'
import { getContext } from '../context'
import { createAction } from '../core/shared/actions'
import { createActionType } from '../core/steps/action-creators'
import { createReducers } from '../core/steps/reducers'
import { createReducerSelectors } from '../core/steps/reducer-selectors'
import { createActions } from '../core/steps/actions'
import { createDefaults } from '../core/steps/defaults'
import { createSelectors } from '../core/steps/selectors'
import { createValues } from '../core/steps/values'

export type LogicBuilder<L extends Logic = Logic> = (logic: BuiltLogic<L>) => void

export const kea = <L extends Logic = Logic>(array: NestedLogicBuilder<L>[]): LogicWrapper<L> => {
  const builders: LogicBuilder<L>[] = flattenBuildersArray<L>(array)

  const logicWrapper: LogicWrapper<L> = {
    path: ['...'],
    builders: builders,
    build: () => null,
  } as any as LogicWrapper<L>

  return logicWrapper
}

export function selectors<L extends Logic = Logic>(
  input: SelectorDefinitions<L> | ((logic: L) => SelectorDefinitions<L>),
): LogicBuilder<L> {
  return (logic) => {
    const selectors = typeof input === 'function' ? input(logic) : input
    createSelectors(logic, { selectors })
    createValues(logic, {})
  }
}

export function listeners<L extends Logic = Logic>(
  input: ReducerDefinitions<L> | ((logic: L) => ReducerDefinitions<L>),
): LogicBuilder<L> {
  return (logic: L) => {}
}

export function loaders<L extends Logic = Logic>(
  input: ReducerDefinitions<L> | ((logic: L) => ReducerDefinitions<L>),
): LogicBuilder<L> {
  return (logic: L) => {
    const loaders = typeof input === 'function' ? input(logic) : input
    logic.extend(Object.entries(loaders).map(([key, loaderInput]) => loader(key, loaderInput)))
  }
}

export function forms<L extends Logic = Logic>(input: FormInput<L> | ((logic: L) => FormInput<L>)): LogicBuilder<L> {
  return (logic) => {
    const loaders = typeof input === 'function' ? input(logic) : input
    logic.extend(Object.entries(loaders).map(([key, loaderInput]) => loader(key, loaderInput)))
  }
}

export function forms<L extends Logic = Logic>(input: FormInput<L> | ((logic: L) => FormInput<L>)): LogicBuilder<L> {
  return (logic) => {
    const forms = typeof input === 'function' ? input(logic) : input
    for (const [formKey, formInput] of forms) {
      actions({
        [`${formKey}Submit`]: true,
        [`${formKey}ChangeValue`]: (value: any) => ({value}),
        [`${formKey}Reset`]: true,
      })(logic)

      reducers({
        [formKey]: {
          [`set${formKey}Value`]: (
              state: Record<string, any>,
              {name, value}: { name: string; value: any },
          ) => deepAssign(state, name, value),
          [`set${formKey}Values`]: (
              state: Record<string, any>,
              {values}: { values: Record<string, any> },
          ) => ({...state, ...values}),
          [`reset${formKey}`]: (
              state: Record<string, any>,
              {values}: { values: Record<string, any> },
          ) => values || formInput.defaults || {},
        },
      })(logic)
    }
    return logic
  }
}

type BuildFunction<InputType, L extends Logic = Logic> = <L>(
  input: InputType | ((logic: BuiltLogic<L>) => InputType),
) => (logic: BuiltLogic<L>) => void

export const loaders: BuildFunction<ReducerDefinitions<Logic>> =
  <L extends Logic = Logic>(input) =>
  (logic) => {
    const loaders = typeof input === 'function' ? input(logic) : input
    logic.extend(Object.entries(loaders).map(([key, loaderInput]) => loader(key, loaderInput)))
  }

export function loader<L extends Logic = Logic>(
  key: string,
  input: ReducerDefinitions<L> | ((logic: L) => ReducerDefinitions<L>),
): LogicBuilder<L> {
  return (logic) => {
    const loader = typeof input === 'function' ? input(logic) : input
    logic.extend(actions({}))
  }
}

function flattenBuildersArray<L extends Logic = Logic>(input: NestedLogicBuilder<L>[], output?: LogicBuilder<L>[]) {
  if (output === undefined) {
    output = []
  }
  for (const element of input) {
    if (Array.isArray(element)) {
      flattenBuildersArray(element, output)
    } else {
      output.push(element)
    }
  }
  return output
}
