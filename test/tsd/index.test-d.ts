import { expectType } from 'tsd'

// It's a bit of a hack, but it works! :-)
// This file is copied to "lib/" and tested against the built bundle, thus we are importing from "." (index.js)
// ... requiring the following comments:
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { kea, MakeLogicType } from '.'

interface DashboardValues {
  id: number
  created_at: string
  name: string
  pinned: boolean
}

interface DashboardActions {
  setName: (name: string) => { name: string }
  setUsername: (username: string) => { username: string }
}

interface DashboardProps {
  id: number
}

type MyLogicType = MakeLogicType<DashboardValues, DashboardActions, DashboardProps>

const logic = kea<MyLogicType>({})

expectType<(name: string) => { type: string; payload: { name: string } }>(logic.actionCreators.setName)
expectType<(name: string) => void>(logic.actions.setName)

expectType<DashboardProps>(logic.props)

expectType<number>(logic.values.id)
expectType<(state: any, props: DashboardProps) => number>(logic.selectors.id)
expectType<(state: number, action: () => any, fullState: any) => number>(logic.reducers.id)
