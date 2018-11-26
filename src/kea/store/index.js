import { createStore, applyMiddleware, combineReducers, compose } from 'redux'

import { keaReducer } from '../reducer'
import { globalPlugins, activatePlugin } from '../plugins'

const reduxDevToolsCompose = typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose

const defaultOptions = {
  paths: ['kea', 'scenes'],
  reducers: {},
  preloadedState: undefined,
  middleware: [],
  compose: reduxDevToolsCompose,
  enhancers: [],
  plugins: []
}

export function getStore (opts = {}) {
  // clone options
  let options = Object.assign({}, defaultOptions, opts)

  // activate all the global plugins
  options.plugins.forEach(plugin => {
    activatePlugin(plugin)
  })

  // clone reducers
  options.reducers = Object.assign({}, options.reducers)
  options.paths.forEach(path => {
    options.reducers[path] = keaReducer(path)
  })

  // run pre-hooks
  globalPlugins.beforeReduxStore.forEach(f => f(options))

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
  const store = finalCreateStore(combinedReducers, {...options.preloadedState})

  // run post-hooks
  globalPlugins.afterReduxStore.forEach(f => f(options, store))

  return store
}
