import corePlugin from '../core'
import { activatePlugin, runPlugins } from '../plugins'

let context

// this will create a default context
resetContext()


export function getContext () {
  return context
}

export function setContext (newContext) {
  context = newContext
}

export function closeContext () {
  if (context && context.plugins) {
    runPlugins(context.plugins, 'beforeCloseContext')
  }

  context = undefined

  if (context && context.plugins) {
    runPlugins(context.plugins, 'afterCloseContext')
  }
}

export function withContext (code, initData = {}) {
  const oldContext = context

  openContext(initData)
  const returnValue = code(context)
  closeContext()

  return {
    context: currentContext,
    returnValue
  }

  context = oldContext
}

export function getReduxStore () {
  return context.store
}

export function attachStore (storeReference) {
  if (context.store) {
    console.error('[KEA] Already attached to a store! Replacing old store! Be aware: this might lead to memory leaks in SSR and elsewhere!')
  }
  context.store = storeReference
}


export function openContext (initData) {
  if (context) {
    console.error("[KEA] Resetting context. This may lead to errors.")
  }

  // TODO: do something with initData
  setContext({
    // actions
    actions: {},

    // reducers
    defaultReducerRoot: null,
    reducerTree: {},
    rootReducers: {},

    // plugins
    plugins: {
      activated: [],
      logicSteps: {},
      logicKeys: {}
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
}

export function resetContext () {
  closeContext()

  openContext()

  if (context && context.plugins) {
    runPlugins(context.plugins, 'afterContext')
  }

  // activate the core plugin
  activatePlugin(corePlugin)
}
