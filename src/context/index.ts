import corePlugin from '../core'
import listenersPlugin from '../listeners/index'
import { activatePlugin, runPlugins } from '../plugins'
import { getStore } from '../store/store'
import { Context, ContextOptions } from '../types'

let context: Context

export function getContext() {
  return context
}

export const getStoreState = () => getContext().store?.getState()

export function setContext(newContext: Context) {
  context = newContext
}

export function openContext(options: ContextOptions = {}) {
  if (context) {
    console.error('[KEA] overwriting already opened context. This may lead to errors.')
  }

  const { plugins, createStore = true, defaults, skipPlugins, ...otherOptions } = options

  const newContext = {
    plugins: {
      activated: [],
      buildOrder: [],
      buildSteps: {},
      events: {},
      logicFields: {},
      contexts: {},
    },

    input: {
      inlinePathCreators: new Map(),
      inlinePathCounter: 0,
      defaults: defaults || undefined,
    },

    build: {
      cache: {},
      heap: [],
    },

    mount: {
      counter: {},
      mounted: {},
    },

    run: {
      heap: [],
    },

    reducers: {
      tree: {},
      roots: {},
      redux: {},
      whitelist: false,
      combined: undefined,
    },

    store: undefined,

    options: {
      debug: false,
      autoMount: false,
      autoConnect: true,
      proxyFields: true,
      flatDefaults: false,
      attachStrategy: 'dispatch',
      detachStrategy: 'dispatch',

      ...otherOptions,
    },
  } as Context

  setContext(newContext)

  activatePlugin(corePlugin)

  if (!skipPlugins || skipPlugins.indexOf('listeners') === -1) {
    activatePlugin(listenersPlugin)
  }

  runPlugins('afterOpenContext', newContext, options)

  if (plugins) {
    for (const plugin of plugins) {
      activatePlugin(plugin)
    }
  }

  if (createStore) {
    getStore(typeof createStore === 'object' ? createStore : {})
  }

  return context
}

export function closeContext() {
  if (context) {
    runPlugins('beforeCloseContext', context)
  }

  context = (undefined as unknown) as Context
}

export function resetContext(options = {}) {
  if (context) {
    closeContext()
  }

  return openContext(options)
}

export function withContext(code: (context?: Context) => any, options = {}) {
  const oldContext = context

  openContext(options)
  const newContext = context
  const returnValue = code(context)
  closeContext()

  context = oldContext

  return {
    context: newContext,
    returnValue,
  }
}

export function getPluginContext(name: string) {
  const { plugins } = getContext()
  if (!plugins.contexts[name]) {
    plugins.contexts[name] = {}
  }
  return plugins.contexts[name]
}

export function setPluginContext(name: string, pluginContext: object) {
  const { plugins } = getContext()
  plugins.contexts[name] = pluginContext
}
