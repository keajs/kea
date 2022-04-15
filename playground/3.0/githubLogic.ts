import { githubLogicType } from './githubLogicType'
import { kea } from "../../src"
import { connect, actions, defaults, reducers, selectors, afterMount, listeners, key, props, path } from '../../src/core'

const API_URL = 'https://api.github.com'

export type Repository = {
  id: number
  stargazers_count: number
  html_url: string
  full_name: string
  forks: number
}

export interface GithubLogicProps {
  id: number
}

export const githubLogic = kea<githubLogicType<Repository, GithubLogicProps>>([
  path(['scenes', 'github', 'githubLogic']),
  props({} as GithubLogicProps),
  key((props) => props.id),

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
