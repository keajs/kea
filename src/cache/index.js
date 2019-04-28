
import corePlugin from '../core'
import { activatePlugin } from '../plugins'

let cache

resetKeaCache()

export function resetKeaCache () {
  if (cache && cache.plugins) {
    cache.plugins.forEach(f => f.clearCache && f.clearCache())
  }

  cache = {
    // actions
    actions: {},

    // reducers
    defaultReducerRoot: null,
    reducerTree: {},
    rootReducers: {},

    // plugins
    plugins: [],
    steps: {},

    // mount
    mountPathCounter: {},
    mountedLogic: {},

    // logic
    inputPathCreators: new WeakMap(),
    globalInputCounter: 0,
    logicCache: {},

    // store
    store: undefined
  }

  // activate the core plugin
  activatePlugin(corePlugin)
}

export function getCache () {
  return cache
}

export function getReduxStore () {
  return cache.store
}

export function attachStore (storeReference) {
  if (cache.store) {
    console.error('[KEA] Already attached to a store! Replacing old store! Be aware: this might lead to memory leaks in SSR and elsewhere!')
  }
  cache.store = storeReference
}
