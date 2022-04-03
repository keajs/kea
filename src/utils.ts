import { BuiltLogic, LogicWrapper } from './types'

export function isLogicWrapper(logic: any): logic is LogicWrapper {
  return '_isKea' in logic
}

export function isBuiltLogic(logic: any): logic is BuiltLogic {
  return '_isKeaBuild' in logic
}
