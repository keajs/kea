import { getCache } from '../cache'

/*
  plugins = [
    {
      // Required: name of the plugin
      name: ''

      // default values for output in logic stores
      defaults: () => ({
        key: {}
      }),

      // Run before the redux store creation begins. Use it to add options (middleware, etc) to the store creator.
      beforeReduxStore (options)

      // Run after the redux store is created.
      afterReduxStore (options, store)

      // Run before we start doing anything
      beforeKea (input)

      // before the steps to convert input into logic
      beforeLogic (logic, input)

      // either add new steps or add after effects for existing steps
      logicSteps: {
        // steps from core that you can extend
        connect (logic, input)
        constants (logic, input)
        actions (logic, input)
        defaults (logic, input)
        reducers (logic, input)
        reducer (logic, input)
        reducerSelectors (logic, input)
        selectors (logic, input)
      }

      // after the steps to convert input into logic
      afterLogic (logic, inpput)

      // Run when a logic store is mounted/unmounted in React
      mounted (pathString, logic)
      unmounted (pathString, logic)

      // Run after mounting and before rendering the component in React's scope (you can use hooks here)
      beforeRender (logic, props)

      // Run when we are removing kea from the system, e.g. when cleaning up after tests
      clearCache ()
    },
    ...
  ]
*/

export function activatePlugin (plugin, pluginTarget = getCache().plugins) {
  pluginTarget.activated.push(plugin)

  if (plugin.logicSteps) {
    for (const key of Object.keys(plugin.logicSteps)) {
      if (pluginTarget.logicSteps[key]) {
        pluginTarget.logicSteps[key].push(plugin.logicSteps[key])
      } else {
        pluginTarget.logicSteps[key] = [plugin.logicSteps[key]]
      }
    }
  }
}

export function runPlugins (plugins, key, ...args) {
  plugins.activated.forEach(p => p[key] && p[key](...args))
}

export function getLocalPlugins (input) {
  let { plugins } = getCache()

  if (input.plugins && input.plugins.length > 0) {
    let allPlugins = {
      activated: [...plugins.activated],
      logicSteps: {}
    }
    for (let key of Object.keys(plugins.logicSteps)) {
      allPlugins.logicSteps[key] = [...plugins.logicSteps[key]]
    }

    for (let plugin of input.plugins) {
      activatePlugin(plugin, allPlugins)
    }
    return allPlugins
  }

  return plugins
}
