import { getCache } from '../cache'

/*
  plugins = [
    {
      // Required: name of the plugin
      name: ''

      // Run before the redux store creation begins. Use it to add options (middleware, etc) to the store creator.
      beforeReduxStore (options)

      // Run after the redux store is created.
      afterReduxStore (options, store)

      // Run before we start doing anything
      beforeKea (input)

      // before the steps to convert input into logic
      beforeSteps (logic, input)

      // either add new steps or add after effects for existing steps
      steps: {
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
      afterSteps (logic, inpput)

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

export function activatePlugin (plugin, pluginTarget = getCache().plugins, stepsTarget = getCache().steps) {
  pluginTarget.push(plugin)

  if (plugin.steps) {
    for (const key of Object.keys(plugin.steps)) {
      if (stepsTarget[key]) {
        stepsTarget[key].push(plugin.steps[key])
      } else {
        stepsTarget[key] = [plugin.steps[key]]
      }
    }
  }
}

export function runPlugins (plugins, key, ...args) {
  plugins.forEach(p => p[key] && p[key](...args))
}

export function getLocalPlugins (input) {
  let { steps, plugins } = getCache()

  if (input.plugins && input.plugins.length > 0) {
    const globalSteps = steps
    const globalPlugins = plugins

    plugins = [...globalPlugins]
    steps = {}

    for (let key of Object.keys(globalSteps)) {
      steps[key] = [...globalSteps[key]]
    }

    for (let plugin of input.plugins) {
      activatePlugin(plugin, plugins, steps)
    }
  }

  return { steps, plugins }
}
