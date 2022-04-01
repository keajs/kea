import { kea, path, actions, reducers, defaults, loaders, forms } from './index'
import type { Logic } from '../types'

interface dashboardLogicType extends Logic {
  actionCreators: {
    setUsername: (username: string) => {
      type: 'set username (samples.githubLogic)'
      payload: {
        username: string
      }
    }
    setRepositories: (repositories: Repository[]) => {
      type: 'set repositories (samples.githubLogic)'
      payload: {
        repositories: Repository[]
      }
    }
    setFetchError: (error: string) => {
      type: 'set fetch error (samples.githubLogic)'
      payload: {
        error: string
      }
    }
  }
  actionKeys: {
    'set username (samples.githubLogic)': 'setUsername'
    'set repositories (samples.githubLogic)': 'setRepositories'
    'set fetch error (samples.githubLogic)': 'setFetchError'
  }
  actionTypes: {
    setUsername: 'set username (samples.githubLogic)'
    setRepositories: 'set repositories (samples.githubLogic)'
    setFetchError: 'set fetch error (samples.githubLogic)'
  }
  actions: {
    setUsername: (username: string) => void
    setRepositories: (repositories: Repository[]) => void
    setFetchError: (error: string) => void
  }
}

// a(logic).

const dashboardLogic = kea<dashboardLogicType>([
  path(['scenes', 'dashboard', 'logic']),
  actions({
    addDashboard: (name: string) => ({ name }),
  }),
  (logic: Logic) => {
    logic.actions['bla'] = () => true
    logic.actionTypes['bla'] = 'bla string'
    logic.events = { afterMount: [] }
    logic.events.afterMount.push(() => {
      print('haha')
    })
    return logic
  },
  reducers((logic) => ({
    something: {
      setUsername: (_, { username }) => username,
    },
  })),
  reducers({
    something: {
      setUsername: (_, { username }) => username,
    },
  }),
  defaults({
    dashboard: null as Dashboard | null,
  }),
  loaders({
    dashboard: {
      __default: null as Dashboard | null,
      addDashboard: ({ name }: { name: string }) => ({ id: -1, name, pinned: true } as Dashboard),
      addDashboardNoType: ({ name }: { name: string }) => ({ id: -1, name, pinned: true } as Dashboard),
    },
    shouldNotBeNeverButAny: {
      __default: [],
    },
    misc: [
      {} as Record<string, any>,
      {
        loadIt: () => ({ id: -1, name, pinned: true }),
      },
    ],
  }),
  forms({
    dashboard: {},
  }),
  [
    forms({
      dashboard: {},
    }),
  ],
])

const a = actions({
  addDashboard: (name: string) => ({ name }),
})
a(0 as any as Logic)?.actions.addDashboard('bla')
a(0 as any as Logic)?.actionCreators.addDashboardChanged()

const otherLogic = kea<otherLogicType>([
  path(['scenes', 'dashboard', 'otherLogic']),
  ...dashboardLogic.inputs,
  reducers((logic) => ({
    something: {
      // anotherActionDoesSomething;
    },
  })),
])
//
//
// loaders({
//     dashboard: {
//         __default: null as Dashboard | null,
//         addDashboard: ({ name }: { name: string }) => ({ id: -1, name, pinned: true } as Dashboard),
//         addDashboardNoType: ({ name }: { name: string }) => ({ id: -1, name, pinned: true } as Dashboard),
//     },
//     shouldNotBeNeverButAny: {
//         __default: [],
//     },
//     misc: [
//         {} as Record<string, any>,
//         {
//             loadIt: () => ({ id: -1, name, pinned: true }),
//         },
//     ],
// }) === [
//     actions({
//         addDashboard: ({ name }: { name: string }) => '...',
//         addDashboardSuccess: ({ name }: { name: string }) => '...',
//         addDashboardFailure: ({ name }: { name: string }) => '...',
//     }),
//     listeners({
//         f
//     }),
// ]
//
// listeners({
//     addDashboard: () => {
//
//     }
// }) === [
//     events((logic) => ({afterMount: () => {
//        addListener(logic.actionTypes.addDashboard, () => {})
//     }))
// ]
