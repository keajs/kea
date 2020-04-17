import { createStore, applyMiddleware, compose } from 'redux'

import { keaReducer, combineKeaReducers } from './reducer'
import { activatePlugin, runPlugins } from '../plugins'
import { getContext } from '../context'

const reduxDevToolsCompose = typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose

// this must be a function as we need new objects every time
// otherwise it could happen that the "middleware" array gets mutated on the default
const defaultOptions = () => ({
  paths: ['kea', 'scenes'],
  reducers: {},
  preloadedState: undefined,
  middleware: [],
  compose: reduxDevToolsCompose,
  enhancers: [],
  plugins: []
})

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
  let options = Object.assign({}, defaultOptions(), opts)

  // clone reducers
  options.reducers = Object.assign({}, options.reducers)
  options.paths.forEach(path => {
    options.reducers[path] = keaReducer(path)
  })

  // run pre-hooks
  runPlugins('beforeReduxStore', options)

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
  runPlugins('afterReduxStore', options, store)

  return store
}
