import corePlugin from '../core'
import { activatePlugin, runPlugins } from '../plugins'
import { kea } from '../index'
import { getStore } from '../store'

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

  const { inputs, plugins, createStore, ...otherOptions } = options

  const newContext = {
    plugins: {
      activated: [],
      buildSteps: {},
      events: {},
      logicFields: {}
    },

    input: {
      inputs: {},
      inputIds: new Map(),
      inlinePathCreators: new Map(),
      inlinePathCounter: 0
    },

    build: {
      cache: {},
    },

    mount: {
      counter: {},
      mounted: {}
    },

    reducers: {
      tree: {},
      roots: {},
      combined: undefined
    },

    store: undefined,

    options: {
      debug: false,    
      autoMount: false,
      proxyFields: true,
      attachStrategy: 'dispatch',
      detachStrategy: 'dispatch',

      ...otherOptions
    }
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

  if (createStore) {
    getStore(typeof createStore === 'object' ? createStore : {})
  }

  if (inputs) {
    context.inputs = { ...inputs }
    Object.values(context.inputs).forEach(kea) // call kea(input) for all inputs
  }

  return context
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

  return openContext(options)
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
