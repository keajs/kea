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

export function openContext (options = {}) {
  if (context) {
    console.error("[KEA] overwriting already opened context. This may lead to errors.")
  }

  // TODO: do something with initData

  const newContext = {
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
    idWeakMap: new WeakMap(),
    pathWeakMap: new WeakMap(),
    inlinePathCounter: 0,
    logicCache: {},

    state: {},

    // store
    store: undefined
  }
  
  setContext(newContext)

  activatePlugin(corePlugin)

  if (options.plugins) {
    for (const plugin of options.plugins) {
      activatePlugin(plugin)
    }
  }

  if (context && context.plugins) {
    runPlugins(context.plugins, 'afterOpenContext')
  }
}

export function closeContext () {
  if (context && context.plugins) {
    runPlugins(context.plugins, 'beforeCloseContext')
  }

  context = undefined
}

export function resetContext (options = {}) {
  if (context) {
    closeContext()
  }

  openContext(options)
}

export function withContext (code, options = {}) {
  const oldContext = context

  openContext(options)
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

export function attachReduxStore (store) {
  if (context.store) {
    console.error('[KEA] Already attached to a store! Replacing old store! Be aware: this might lead to memory leaks in SSR and elsewhere!')
  }
  context.store = store
}
