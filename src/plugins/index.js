export let plugins = []

/*
  plugins = [
    {
      // Required: name of the plugin
      name: ''

      // Run before the redux store creation begins. Use it to add options (middleware, etc) to the store creator.
      beforeReduxStore (options)

      // Run after the redux store is created.
      afterReduxStore (options, store)

      // Run before we start converting the input into the output
      beforeCreate (input, output)

      // Run after each step in the conversion
      afterCreateConnect (input, output)
      afterCreateConstants (input, output)
      afterCreateActions (input, output)
      afterCreateReducers (input, output)
      afterCreateReducerSelectors (input, output)
      afterCreateSelectors (input, output)

      // Run after the input is fully converted to the output
      afterCreate (input, output)

      // Run when a logic store is mounted in React
      mountedPath (path, logic)
      unmountedPath (path, logic)

      // Run when we are removing kea from the system, e.g. when cleaning up after tests
      clearCache ()
    },
    ...
  ]
*/

// old and to be removed/migrated
//   // // f(input, output)
//   // afterConnect: [],

//   // // f(input, output)
//   // afterCreateSingleton: [],

//   // // f(input, output, reducerObjects)
//   // mutateReducerObjects: [],

//   // // f(input, output, reducer)
//   // mutateReducer: [],

//   // // f(input, output, Klass)
//   // injectToClass: [],

//   // // f(input, output, KonnektedKlass)
//   // injectToConnectedClass: [],

//   // // f(input, output, response)
//   // addToResponse: [],

// }

export function activatePlugin (plugin) {
  plugins.push(plugin)
}

export function clearActivatedPlugins () {
  plugins.forEach(f => f.clearCache && f.clearCache())
  plugins = []
}
