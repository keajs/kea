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

expectType<(name: string) => { type: string, payload: { name: string } }>(logic.actionCreators.setName)
expectType<(name: string) => void>(logic.actions.setName)
