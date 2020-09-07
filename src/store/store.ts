import { createStore, applyMiddleware, compose, Store, StoreEnhancer } from 'redux'

import { createReduxStoreReducer, initRootReducerTree } from './reducer'
import { runPlugins } from '../plugins'
import { getContext } from '../context'
import { CreateStoreOptions } from '../types'

const reduxDevToolsCompose =
  typeof window !== 'undefined' && (window as any)['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__']
    ? (window as any)['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__']
    : compose

// this must be a function as we need new objects every time
// otherwise it could happen that the "middleware" array gets mutated on the default
const defaultOptions = (): CreateStoreOptions => ({
  paths: [],
  reducers: {},
  preloadedState: undefined,
  middleware: [],
  compose: reduxDevToolsCompose,
  enhancers: [],
  plugins: [],
})

export function getStore(opts = {}): Store | void {
  const context = getContext()

  if (!context) {
    console.error('[KEA] Can not create a store without being in a context')
    return
  }

  if (context['__store']) {
    console.error('[KEA] Already attached to a store! Exiting. Please reset the context before requesing a store')
    return
  }

  // clone options
  const options = Object.assign({}, defaultOptions(), opts)

  // clone redux reducers
  context.reducers.redux = Object.assign({}, options.reducers)

  // run pre-hooks
  runPlugins('beforeReduxStore', options)

  // combine middleware into the first enhancer
  if (options.middleware.length > 0) {
    options.enhancers = ([applyMiddleware(...options.middleware)] as StoreEnhancer[]).concat(options.enhancers)
  }

  // use a special compose function?
  const composeEnchancer: typeof compose = options.compose || compose

  // create the store creator
  const finalCreateStore = composeEnchancer(...options.enhancers)(createStore) as typeof createStore

  // if we are whitelisting paths
  if (options.paths && options.paths.length > 0) {
    context.reducers.whitelist = {}
    options.paths.forEach((pathStart) => {
      ;(context.reducers.whitelist as Record<string, any>)[pathStart] = true
      initRootReducerTree(pathStart)
    })
  } else {
    initRootReducerTree('kea')
  }

  // create store
  const store = finalCreateStore(createReduxStoreReducer(), Object.assign({}, options.preloadedState))
  context['__store'] = store

  // run post-hooks
  runPlugins('afterReduxStore', options, store)

  return store
}
