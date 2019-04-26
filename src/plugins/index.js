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

      // Run before we start converting the input into the logic
      beforeCreate (logic, input)

      // Run after each step in the conversion
      afterConnect (logic, input, addConncetion)
      afterConstants (logic, input)
      afterActions (logic, input)
      afterReducerInputs (logic, input)
      afterReducers (logic, input)
      afterReducerSelectors (logic, input)
      afterSelectors (logic, input)

      // Run after the input is fully converted to the logic
      afterCreate (logic, input)

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

export function activatePlugin (plugin) {
  getCache().plugins.push(plugin)
}

export function runPlugins (plugins, key, ...args) {
  plugins.forEach(p => p[key] && p[key](...args))
}
