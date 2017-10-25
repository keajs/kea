export let globalPlugins = {
  // all plugins that are activated
  _activated: {},

  // f(options)
  beforeReduxStore: [],

  // f(options, store)
  afterReduxStore: [],

  // f(input, output) => bool
  isActive: [],

  // f(input, output)
  afterConnect: [],

  // f(input, output)
  afterCreateSingleton: [],

  // f(input, output, reducerObjects)
  mutateReducerObjects: [],

  // f(input, output, reducer)
  mutateReducer: [],

  // f(input, output, Klass)
  injectToClass: [],

  // f(input, output, KonnektedKlass)
  injectToConnectedClass: [],

  // f(input, output, response)
  addToResponse: [],

  // f()
  clearCache: []
}

export function activatePlugin (plugin, pluginTarget = globalPlugins) {
  if (!pluginTarget._activated[plugin.name]) {
    Object.keys(plugin).forEach(key => {
      if (typeof plugin[key] === 'function') {
        plugin[key]._name = plugin.name
        pluginTarget[key].push(plugin[key])
      }
    })

    pluginTarget._activated[plugin.name] = true
  }
}

export function clearActivatedPlugins (pluginTarget = globalPlugins) {
  pluginTarget.clearCache.forEach(f => f())

  Object.keys(pluginTarget).forEach(key => {
    pluginTarget[key] = []
  })
  pluginTarget._activated = {}
}
