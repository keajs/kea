import { activatePlugin, runPlugins } from './plugins'
import { getStore } from './store'
import { Context, ContextOptions } from '../types'
import { Store } from 'redux'
import { corePlugin } from '../core'

let context: Context

export function getContext(): Context {
  return context
}

export const getStoreState = () => getContext().store.getState()

export function setContext(newContext: Context): void {
  context = newContext
}

let contextId = 0

export function openContext(options: ContextOptions = {}, initial = false): Context {
  if (context) {
    console.error('[KEA] overwriting already opened context. This may lead to errors.')
  }

  const { plugins, createStore = true, ...otherOptions } = options

  const newContext = {
    contextId: `kea-context-${contextId++}`,
    plugins: {
      activated: [],
      events: {},
      logicFields: {},
      contexts: {},
    },

    inputCounter: 0,
    reducerDefaults: undefined,
    wrapperContexts: new WeakMap(),
    buildHeap: [],

    mount: {
      counter: {},
      mounted: {},
    },

    react: {
      contexts: new WeakMap(),
    },

    reducers: {
      tree: {},
      roots: {},
      redux: {},
      whitelist: false,
      combined: undefined,
    },

    store: undefined as unknown as Store, // will be redefined below
    __store: undefined,

    options: {
      debug: false,
      proxyFields: true,
      flatDefaults: false,
      attachStrategy: 'dispatch',
      detachStrategy: 'dispatch',
      defaultPath: ['kea', 'logic'],
      ...otherOptions,
    },
  } as Context

  // defer creating a store on the default resetContext() until it's requested
  Object.defineProperty(newContext, 'store', {
    get: function get() {
      const store: Store = (newContext as any)['__store']
      if (!store && createStore) {
        return getStore(typeof createStore === 'object' ? createStore : {})
      }
      return store
    },
    set: function set(store) {
      ;(newContext as any)['__store'] = store
    },
  })

  setContext(newContext)

  activatePlugin(corePlugin)

  runPlugins('afterOpenContext', newContext, options)

  if (plugins) {
    for (const plugin of plugins) {
      activatePlugin(plugin)
    }
  }

  if (!initial && createStore) {
    context.store // trigger the getter that creates the store
  }

  return context
}

export function closeContext(): void {
  if (context) {
    runPlugins('beforeCloseContext', context)
  }

  context = undefined as unknown as Context
}

export function resetContext(options: ContextOptions = {}, initial = false): Context {
  if (context) {
    closeContext()
  }

  return openContext(options, initial)
}

export function getPluginContext<Context = Record<string, any>>(name: string): Context {
  const { plugins } = getContext()
  if (!plugins.contexts[name]) {
    plugins.contexts[name] = {}
  }
  return plugins.contexts[name] as Context
}

export function setPluginContext<Context = Record<string, any>>(name: string, pluginContext: Context): void {
  const { plugins } = getContext()
  plugins.contexts[name] = pluginContext
}
