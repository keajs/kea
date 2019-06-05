import { getContext } from '../context'

/*
  plugins = [
    {
      // Required: name of the plugin
      name: ''

      // default values for output in logic stores, also used to register keys that logic will contain
      defaults: () => ({
        key: {}
      }),

      afterOpenContext (context, options)

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
        // or add your own steps with custom names here and other plugins can then extend them
      }

      // after the steps to convert input into logic
      afterLogic (logic, inpput)

      // Run when a logic store is mounted/unmounted in React
      mounted (pathString, logic)
      unmounted (pathString, logic)

      // when wrapping a React component
      beforeWrapper (input, Klass)
      afterWrapper (input, Klass, Kea)

      // Run after mounting and before rendering the component in React's scope (you can use hooks here)
      beforeRender (logic, props)

      // Run when we are removing kea from the system, e.g. when cleaning up after tests
      beforeCloseContext (context)
    },
    ...
  ]
*/

const reservedKeys = {
  key: true,
  path: true,
  plugins: true,
  props: true,
  mounted: true,
  extend: true
}

export const reservedProxiedKeys = [
  'path',
  'plugins'
]

export function activatePlugin (plugin, pluginTarget = getContext().plugins) {
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

  if (plugin.defaults) {
    const defaultKeys = Object.keys(plugin.defaults())
    for (const key of defaultKeys) {
      if (process.env.NODE_ENV !== 'production') {
        if (pluginTarget.logicKeys[key] || reservedKeys[key]) {
          console.warn(`[KEA] Plugin "${plugin.name}" redefines logic key "${key}".`)
        }
      }
      pluginTarget.logicKeys[key] = true
    }
  }
}

// run plugins with this key with the rest of the arguments
export function runPlugins (plugins, key, ...args) {
  plugins.activated.forEach(p => p[key] && p[key](...args))
}

// make a murky deep copy of the plugins object
function copyPlugins (plugins) {
  let copy = {
    activated: [...plugins.activated],
    logicSteps: {},
    logicKeys: Object.assign({}, plugins.logicKeys)
  }
  for (let key of Object.keys(plugins.logicSteps)) {
    copy.logicSteps[key] = [...plugins.logicSteps[key]]
  }
  return copy
}

// TODO: this needs to be cached somehow! Right now rebuilds too often if using any local plugins!
export function getLocalPlugins (input) {
  let { plugins } = getContext()

  // return global (activated) plugins if no need to add local plugins
  if (!input.plugins || input.plugins.length === 0) {
    return plugins
  }

  // otherwise copy the global plugins...
  let localPlugins = copyPlugins(plugins)

  // and add all the local ones
  for (let plugin of input.plugins) {
    activatePlugin(plugin, localPlugins)
  }

  return localPlugins
}
