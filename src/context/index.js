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
    plugins: {
      activated: [],
      logicSteps: {},
      logicKeys: {}
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

  if (inputs) {
    context.inputs = { ...inputs }
    Object.values(context.inputs).forEach(kea) // call kea(input) for all inputs
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
