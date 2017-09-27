export let installedPlugins = []

export function activatePlugin (plugin) {
  installedPlugins.push(plugin)
}
