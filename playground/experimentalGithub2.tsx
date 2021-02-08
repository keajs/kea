import { Logic } from '../src'

type Merge<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B extends infer O
  ? { [K in keyof O]: O[K] }
  : never

type ActionsToTypes<A extends Record<string, any>> = {
  [K in keyof A]: (actionParam: string, otherParam: boolean) => A[K]
}

type InjectActions<L extends Logic, T extends object> = Merge<
  L,
  {
    actions: Merge<L['actions'], ActionsToTypes<T>>
    actionCreators: Merge<L['actions'], ActionsToTypes<T>>
  }
>

export type CreateFunctions<L extends Logic> = {
  addActions<A extends object>(actions: A): Merge<InjectActions<L, A>, CreateFunctions<InjectActions<L, A>>>
}
function logicCreator<L extends Logic>(): Merge<L, CreateFunctions<L>> {
  return ({} as any) as Merge<L, CreateFunctions<L>>
}

const logi = logicCreator()

const logi2 = logi.addActions({ something: true })
logi2.actions.something('asd', true)
logi2.addActions({})

const logi3 = logi
  .addActions({ something1: true })
  .addActions({ something2: true })
  .addActions({ something3: true })
  .addActions({ something4: true })
  .addActions({ something5: true })
  .addActions({ something6: true })
  .addActions({ something7: true })
  .addActions({ something8: true })
  .addActions({ something9: true })
  .addActions({ something10: true })
  .addActions({ something11: true })
  .addActions({ something12: true })
  .addActions({ something13: true })
  .addActions({ something14: true })
  .addActions({ something15: true })
  .addActions({ something16: true })
  .addActions({ something17: true })
  .addActions({ something18: true })
  .addActions({ something19: true })
  .addActions({ something20: true, a: true, b: true })
  .addActions({ something21: true })
  .addActions({ something22: true })
  .addActions({ something23: true })
  .addActions({ something24: true })
  .addActions({ something25: true })
  .addActions({ something26: true })
  .addActions({ something27: true })
  .addActions({ something28: true })
  .addActions({ something29: true })

logi3.actions.something1('asd', true)
logi3.actions.something2('asd', true)
logi3.actions.something3('bla', true)
logi3.actions.something4('bla', true)
logi3.actions.something5('bla', true)
logi3.actions.something6('bla', true)
logi3.actions.something7('bla', true)
logi3.actions.something8('bla', true)
logi3.actions.something9('bla', true)
logi3.actions.something10('bla', true)
logi3.actions.something11('bla', true)
logi3.actions.something12('bla', true)
logi3.actions.something13('bla', true)
logi3.actions.something14('bla', true)
logi3.actions.something15('bla', true)
logi3.actions.something16('bla', true)
logi3.actions.something17('bla', true)
logi3.actions.something18('bla', true)
logi3.actions.something19('bla', true)
logi3.actions.something20('bla', true)
logi3.actions.something21('bla', true)
logi3.actions.something22('bla', true)
logi3.actions.something23('bla', true)
logi3.actions.something24('bla', true)
logi3.actions.something25('bla', true)
logi3.actions.something26('bla', true)
logi3.actions.something27('bla', true)
logi3.actions.something28('bla', true)
logi3.actions.something29('bla', true)
