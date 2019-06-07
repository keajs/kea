import corePlugin from '../core'
import { activatePlugin, runPlugins } from '../plugins'
import { kea } from '../index'

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
    console.error('[KEA] overwriting already opened context. This may lead to errors.')
  }

  // TODO: do something with initData

  const { inputs, plugins, ...otherOptions } = options

  const newContext = {
    debug: false,

    // reducers
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
    autoMount: false,
    inputs: inputs ? { ...inputs } : {},

    pathWeakMap: new WeakMap(),
    inlinePathCounter: 0,
    logicCache: {},
    proxyFields: true,

    state: {},

    // store
    store: undefined,
    combinedReducers: undefined,
    attachStrategy: 'dispatch',
    detachStrategy: 'dispatch',

    ...otherOptions
  }

  setContext(newContext)

  activatePlugin(corePlugin)

  if (plugins) {
    for (const plugin of plugins) {
      activatePlugin(plugin)
    }
  }

  if (context && context.plugins) {
    runPlugins(context.plugins, 'afterOpenContext', context, options)
  }

  if (context.autoMount && context.inputs) {
    for (const input of Object.values(context.inputs)) {
      kea(input).mount && kea(input).mount()
    }
  }
}

export function closeContext () {
  if (context && context.plugins) {
    runPlugins(context.plugins, 'beforeCloseContext', context)
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
  const newContext = context
  const returnValue = code(context)
  closeContext()

  context = oldContext

  return {
    context: newContext,
    returnValue
  }
}
