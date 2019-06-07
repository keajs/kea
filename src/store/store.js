import { createStore, applyMiddleware, compose } from 'redux'

import { keaReducer, combineKeaReducers } from './reducer'
import { activatePlugin, runPlugins } from '../plugins'
import { getContext } from '../context'

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
  const context = getContext()

  if (!context) {
    console.error('[KEA] Can not create a store without being in a context')
    return
  }

  if (context.store) {
    console.error('[KEA] Already attached to a store! Exiting. Please reset the context before requesing a store')
    return
  }

  // clone options
  let options = Object.assign({}, defaultOptions, opts)

  if (process.env.NODE_ENV !== 'production') {
    if (options.plugins.length > 0) {
      console.error('[KEA] Passing plugins to getStore is deprecated. Pass them to a context instead.')
    }
  }

  // activate all the plugins
  options.plugins.forEach(plugin => {
    activatePlugin(plugin)
  })

  // clone reducers
  options.reducers = Object.assign({}, options.reducers)
  options.paths.forEach(path => {
    options.reducers[path] = keaReducer(path)
  })

  // run pre-hooks
  runPlugins(context.plugins, 'beforeReduxStore', options)

  // combine middleware into the first enhancer
  if (options.middleware.length > 0) {
    options.enhancers = [applyMiddleware(...options.middleware)].concat(options.enhancers)
  }

  // use a special compose function?
  const composeEnchancer = options.compose || compose

  // create the store creator
  const finalCreateStore = composeEnchancer(...options.enhancers)(createStore)

  // combine reducers
  const combined = combineKeaReducers(options.reducers)
  context.reducers.combined = combined

  // create store
  const store = finalCreateStore(combined, Object.assign({}, options.preloadedState))
  context.store = store

  // run post-hooks
  runPlugins(context.plugins, 'afterReduxStore', options, store)

  return store
}
