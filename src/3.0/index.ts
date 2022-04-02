import { Logic, LogicBuilder, LogicWrapper } from '../types'

export const kea = <L extends Logic = Logic>(builders: LogicBuilder<L>[]): LogicWrapper<L> => {
  const logicWrapper: LogicWrapper<L> = {
    path: ['...'],
    builders: builders,
    build: () => null,
  } as any as LogicWrapper<L>

  return logicWrapper
}
