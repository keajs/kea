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

      // either add new steps or add after effects for existing steps
      buildSteps: {
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

      events: {
        // Run after creating a new context, before plugins and inputs are applied
        afterOpenContext (context, options)

        // Run before the redux store creation begins. Use it to add options (middleware, etc) to the store creator.
        beforeReduxStore (options)

        // Run after the redux store is created.
        afterReduxStore (options, store)

        // Run before we start doing anything
        beforeKea (input)

        // before the steps to build the logic (gets an array of inputs from kea(input).extend(input))
        beforeBuild (logic, inputs)

        // before the steps to convert input into logic (also run once per .extend())
        beforeLogic (logic, input)

        // after the steps to convert input into logic (also run once per .extend())
        afterLogic (logic, input)

        // after the steps to build the logic
        afterBuild (logic, inputs)

        // Run before/after a logic store is mounted in React
        beforeMount (pathString, logic)
        afterMount (pathString, logic)

        // Run before/after a reducer is attached to Redux
        beforeAttach (pathString, logic)
        afterAttach (pathString, logic)

        // Run before/after a logic store is unmounted in React
        beforeUnmount (pathString, logic)
        afterUnmount (pathString, logic)

        // Run before/after a reducer is detached frm Redux
        beforeDetach (pathString, logic)
        afterDetach (pathString, logic)

        // when wrapping a React component
        beforeWrapper (input, Klass)
        afterWrapper (input, Klass, Kea)

        // Run after mounting and before rendering the component in React's scope (you can use hooks here)
        beforeRender (logic, props)

        // Run when we are removing kea from the system, e.g. when cleaning up after tests
        beforeCloseContext (context)
      }
    }
  ]
*/

const reservedKeys = {
  key: true,
  path: true,
  pathString: true,
  props: true,
  
  wrap: true,
  build: true,
  mount: true,
  extend: true
}

export const reservedProxiedKeys = [
  'path',
  'pathString',
  'props',
  'mount'
]

export function activatePlugin (plugin) {
  const { plugins } = getContext()
  const { name } = plugin

  if (!name) {
    throw new Error('[KEA] Tried to activate a plugin without a name!')
  }

  plugins.activated.push(plugin)

  if (plugin.buildSteps) {
    for (const key of Object.keys(plugin.buildSteps)) {
      if (plugins.buildSteps[key]) {
        plugins.buildSteps[key].push(plugin.buildSteps[key])
      } else {
        plugins.buildSteps[key] = [plugin.buildSteps[key]]
      }
    }
  }

  if (plugin.defaults) {
    const fields = Object.keys(plugin.defaults())
    for (const key of fields) {
      if (process.env.NODE_ENV !== 'production') {
        if (plugins.logicFields[key] || reservedKeys[key]) {
          console.error(`[KEA] Plugin "${plugin.name}" redefines logic field "${key}". Previously defined by ${plugins.logicFields[key] || 'core'}`)
        }
      }
      plugins.logicFields[key] = plugin.name
    }
  }

  if (plugin.events) {
    for (const key of Object.keys(plugin.events)) {
      if (!plugins.events[key]) {
        plugins.events[key] = []
      }
      plugins.events[key].push(plugin.events[key])
    }
  }
}

// run plugins with this key with the rest of the arguments
export function runPlugins (key, ...args) {
  const { plugins, options: { debug } } = getContext()
  if (debug) {
    console.log(`[KEA] Event: ${key}`, ...args)
  }
  plugins && plugins.events[key] && plugins.events[key].forEach(p => p(...args))
}
