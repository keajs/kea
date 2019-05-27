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

export function openContext (initData = {}, plugins = undefined) {
  if (context) {
    console.error("[KEA] reopening already opened context. This may lead to errors.")
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
    inputPathCreators: new WeakMap(),
    globalInputCounter: 0,
    logicCache: {},

    // store
    store: undefined
  }
  
  setContext(newContext)

  activatePlugin(corePlugin)

  if (plugins) {
    for (const plugin of plugins) {
      activatePlugin(plugin)
    }
  }
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

export function resetContext (initData = {}, plugins = undefined) {
  if (context) {
    closeContext()
  }

  openContext(initData, plugins)
}

export function withContext (code, initData = {}, plugins = undefined) {
  const oldContext = context

  openContext(initData, plugins)
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
