import { kea } from '../src/kea/kea'
import { MakeLogicType } from '../src/types'
import { useValues } from '../src/react/hooks'

interface DashboardValues {
  id: number
  created_at: string
  name: string
  pinned: boolean
}

interface DashboardActions {
  setName: (name: string) => void
  setUsername: (username: string) => void
}

interface DashboardProps {
  id: number
}
// type MyLogicType = MakeLogicType<DashboardValues, DashboardActions>
type MyLogicType = MakeLogicType<DashboardValues, DashboardActions, DashboardProps>
const makeLogicTypeLogic = kea<MyLogicType>({})

makeLogicTypeLogic.actions.setName('asd')
makeLogicTypeLogic.actions.setUsername('waere')

type PropsType = MyLogicType['props']

const { id } = useValues(makeLogicTypeLogic)
makeLogicTypeLogic.build({ id: 123 })
// makeLogicTypeLogic({ id: 'asd' })
makeLogicTypeLogic()
