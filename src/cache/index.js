import corePlugin from '../core'
import { activatePlugin, runPlugins } from '../plugins'

import { getCache, setCache } from './provider'

export { getCache, setCache, getReduxStore, attachStore } from './provider'

export function resetKeaCache () {
  const cache = getCache()

  if (cache && cache.plugins) {
    runPlugins(cache.plugins, 'clearCache')
  }

  setCache({
    // actions
    actions: {},

    // reducers
    defaultReducerRoot: null,
    reducerTree: {},
    rootReducers: {},

    // plugins
    plugins: {
      activated: [],
      logicSteps: {}
    },

    // mount
    mountPathCounter: {},
    mountedLogic: {},

    // logic
    inputPathCreators: new WeakMap(),
    globalInputCounter: 0,
    logicCache: {},

    // store
    store: undefined
  })

  // activate the core plugin
  activatePlugin(corePlugin)
}

resetKeaCache()
