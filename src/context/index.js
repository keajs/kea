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

export const getStoreState = () => getContext().store.getState()

export function setContext (newContext) {
  context = newContext
}

export function openContext (options = {}) {
  if (context) {
    console.error('[KEA] overwriting already opened context. This may lead to errors.')
  }

  const { plugins, createStore, defaults, ...otherOptions } = options

  const newContext = {
    plugins: {
      activated: [],
      buildSteps: {},
      events: {},
      logicFields: {}
    },

    input: {
      inlinePathCreators: new Map(),
      inlinePathCounter: 0,
      defaults: defaults || undefined
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
      flatDefaults: false,
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

  runPlugins('afterOpenContext', newContext, options)

  if (createStore) {
    getStore(typeof createStore === 'object' ? createStore : {})
  }

  return context
}

export function closeContext () {
  if (context) {
    runPlugins('beforeCloseContext', context)
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
