export let installedPlugins = []
let installedPluginHash = {}

export function activatePlugin (plugin) {
  if (!installedPluginHash[plugin.name]) {
    installedPlugins.push(plugin)

    installedPluginHash[plugin.name] = true
  }
}
