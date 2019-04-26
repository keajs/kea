let cache

resetKeaCache()

export function resetKeaCache () {
  if (cache && cache.plugins) {
    cache.plugins.forEach(f => f.clearCache && f.clearCache())
  }

  cache = {
    // reducers
    defaultReducerRoot: null,
    reducerTree: {},
    rootReducers: {},

    // plugins
    plugins: [],

    // mount
    mountPathCounter: {},
    mountedLogic: {},

    // logic
    inputPathCreators: new WeakMap(),
    globalInputCounter: 0,
    logicCache: {}
  }
}

export function getCache () {
  return cache
}
