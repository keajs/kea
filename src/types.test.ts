import { expectType } from 'tsd'
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
