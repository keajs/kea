import { createStore, applyMiddleware, combineReducers, compose } from 'redux'

import { keaReducer } from '../reducer'
import { installedPlugins } from '../plugins'

const defaultOptions = {
  paths: ['kea', 'scenes'],
  middleware: [],
  reducers: {}
}

export function getStore (opts = {}) {
  // clone options
  let options = Object.assign({}, defaultOptions, opts)

  // clone reducers
  options.reducers = Object.assign({}, options.reducers)
  options.paths.forEach(path => {
    options.reducers[path] = keaReducer(path)
  })

  // run pre-hooks
  installedPlugins.forEach(plugin => {
    plugin.beforeReduxStore && plugin.beforeReduxStore(options)
  })

  let finalCreateStore

  // combine middleware
  if (options.middleware) {
    finalCreateStore = compose(...(options.middleware.map(m => applyMiddleware(m))))(createStore)
  } else {
    finalCreateStore = createStore
  }

  // combine reducers
  const combinedReducers = combineReducers(options.reducers)

  // create store
  const store = finalCreateStore(combinedReducers)

  // run post-hooks
  installedPlugins.forEach(plugin => {
    plugin.afterReduxStore && plugin.afterReduxStore(options, store)
  })

  return store
}
