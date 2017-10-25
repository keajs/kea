import { createStore, applyMiddleware, combineReducers, compose } from 'redux'

import { keaReducer } from '../reducer'
import { installedPlugins } from '../plugins'

const reduxDevToolsCompose = typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose

const defaultOptions = {
  paths: ['kea', 'scenes'],
  reducers: {},
  middleware: [],
  compose: reduxDevToolsCompose,
  enhancers: []
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
  installedPlugins.beforeReduxStore.forEach(f => f(options))

  // combine middleware into the first enhancer
  if (options.middleware.length > 0) {
    options.enhancers = [applyMiddleware(...options.middleware)].concat(options.enhancers)
  }

  // use a special compose function?
  const composeEnchancer = options.compose || compose

  // create the store creator
  const finalCreateStore = composeEnchancer(...options.enhancers)(createStore)

  // combine reducers
  const combinedReducers = combineReducers(options.reducers)

  // create store
  const store = finalCreateStore(combinedReducers)

  // run post-hooks
  installedPlugins.afterReduxStore.forEach(f => f(options, store))

  return store
}
