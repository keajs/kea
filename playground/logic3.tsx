import * as React from 'react'
import {
  actions,
  defaults,
  events,
  kea,
  key,
  listeners,
  path,
  props,
  reducers,
  selectors,
  sharedListeners,
  useValues,
} from '../src'
import { logicType } from './logicType'
import { githubLogic } from './githubLogic'

interface Session {
  user: number
  type: string
}

export const logic = kea<logicType<Session>>([
  props({} as { id: number }),
  key((props) => props.id),
  path((key) => ['scenes', 'homepage', 'index', key]),
  actions({
    updateName: (name: string) => ({ name }),
    updateNumber: (number: number) => ({ number }),
  }),
  defaults({
    yetAnotherNameWithNullDefault: 'blue' as string | null,
  }),
  reducers(() => {
    return {
      name: [
        'birdname',
        {
          updateName: (_, { name }) => name,
        },
      ],
      number: [
        1232,
        {
          updateNumber: (_, { number }) => number,
        },
      ],
      persistedNumber: [
        1232,
        {
          updateNumber: (_, { number }) => number,
        },
      ],
      otherNameNoDefault: {
        updateName: (_, { name }) => name,
      },
      yetAnotherNameWithNullDefault: [
        null as string | null,
        {
          updateName: (_, { name }) => name,
          [githubLogic.actionTypes.setUsername]: (_, { username }) => username,
        },
      ],
    }
  }),
  selectors(({ selectors }) => ({
    capitalizedName: [
      (s) => [s.name, s.number],
      (name, number) => {
        return (
          name
            .trim()
            .split(' ')
            .map((k) => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`)
            .join(' ') + number.toString()
        )
      },
    ],
    upperCaseName: [
      () => [selectors.capitalizedName],
      (capitalizedName) => {
        return capitalizedName.toUpperCase()
      },
    ],
  })),
  // loaders(() => ({
  //   sessions: {
  //     __default: [] as Session[],
  //     loadSessions: async (selectedDate: string): Promise<Session[]> => {
  //       const response = { user: 3, type: 'bla' }
  //       return [response]
  //     },
  //   },
  // })),
  listeners(() => ({
    updateNumber: ({ number }) => {
      console.log(number)
    },
    [githubLogic.actionTypes.setUsername]: ({ username }) => {
      console.log(username)
    },
  })),
  sharedListeners(() => ({})),
  events({
    afterMount: () => {
      console.log('after mount')
    },
  }),
])

function MyComponent(): JSX.Element {
  const { number } = useValues(logic)
  // logic({ id: 'asd' })
  logic({ id: 12 })
  logic()
  logic.build({ id: 123 })

  const builtLogic = logic.build({ id: 123 })
  builtLogic.actions.updateName('')
  builtLogic.values.name

  return <div />
}
