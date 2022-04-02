import { githubLogicType } from './githubLogicType'
import { kea } from '../index'
import { connect } from '../steps/connect'
import { actions } from '../steps/actions'
import { defaults } from '../steps/defaults'
import { reducers } from '../steps/reducers'
import { selectors } from '../steps/selectors'
import { afterMount } from '../steps/events'
import { listeners } from '../plugins/listeners'

const API_URL = 'https://api.github.com'

export type Repository = {
  id: number
  stargazers_count: number
  html_url: string
  full_name: string
  forks: number
}

export const githubLogic = kea<githubLogicType<Repository>>([
  actions({
    setUsername: (username: string) => ({ username }),
    setRepositories: (repositories: Repository[]) => ({ repositories }),
    setFetchError: (error: string) => ({ error }),
  }),
  connect({
    actions: [],
  }),
  defaults({
    username: 'keajs',
    repositories: [] as Repository[],
  }),
  reducers({
    username: {
      setUsername: (_, { username }) => username,
    },
    repositories: {
      setUsername: () => [],
      setRepositories: (_, { repositories }) => repositories,
    },
    isLoading: [
      false,
      {
        setUsername: () => true,
        setRepositories: () => false,
        setFetchError: () => false,
      },
    ],
    error: [
      null as string | null,
      {
        setUsername: () => null,
        setFetchError: (_, { error }) => error,
      },
    ],
  }),

  selectors({
    sortedRepositories: [
      (s) => [s.repositories],
      (repositories) => {
        return [...repositories].sort((a, b) => b.stargazers_count - a.stargazers_count)
      },
    ],
  }),

  listeners(({ actions }) => ({
    setUsername: async ({ username }, breakpoint, action, fullState) => {
      await breakpoint(300)

      const url = `${API_URL}/users/${username}/repos?per_page=250`

      // 👈 handle network errors
      let response
      try {
        response = await window.fetch(url)
      } catch (error: any) {
        actions.setFetchError(error.message)
        return // 👈 nothing to do after, so return
      }

      // break if action was dispatched again while we were fetching
      breakpoint()

      const json = await response.json()

      if (response.status === 200) {
        actions.setRepositories(json)
      } else {
        actions.setFetchError(json.message)
      }
    },
  })),

  afterMount(({ actions, values }) => {
    actions.setUsername(values.username)
  }),
])
