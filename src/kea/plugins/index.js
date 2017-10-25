export let installedPlugins = {
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

  // f(input, output, Klass)
  injectToClass: [],

  // f(input, output, KonnektedKlass)
  injectToConnectedClass: [],

  // f(input, output, response)
  addToResponse: []
}
let installedPluginHash = {}

export function activatePlugin (plugin) {
  if (!installedPluginHash[plugin.name]) {
    Object.keys(plugin).forEach(key => {
      if (typeof plugin[key] === 'function') {
        plugin[key]._name = plugin.name
        installedPlugins[key].push(plugin[key])
      }
    })

    installedPluginHash[plugin.name] = true
  }
}
