import { getContext } from '../context/index'
import { KeaPlugin, PluginEvents } from '../types'
/*
  plugins = [
    {
      // Required: name of the plugin
      name: ''

      // default values for output in logic stores, also used to register keys that logic will contain
      defaults: () => ({
        key: {}
      }),

      // when are the build steps run (skip this and they are appended to the end)
      buildOrder: {
        listeners: { before: 'events' },
        thunks: { after: 'actionCreators' }
      },

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
        // Run after creating a new context, before plugins are activated and the store is created
        afterOpenContext (context, options)

        // Run after this plugin has been activated
        afterPlugin ()

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
        beforeMount (logic)
        afterMount (logic)

        // Run before/after a reducer is attached to Redux
        beforeAttach (logic)
        afterAttach (logic)

        // Run before/after a logic store is unmounted in React
        beforeUnmount (logic)
        afterUnmount (logic)

        // Run before/after a reducer is detached frm Redux
        beforeDetach (logic)
        afterDetach (logic)

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
  wrapper: true,

  wrap: true,
  build: true,
  mount: true,
  extend: true,
}

export function activatePlugin(pluginToActivate: KeaPlugin | (() => KeaPlugin)): void {
  const plugin = typeof pluginToActivate === 'function' ? pluginToActivate() : pluginToActivate

  const { plugins } = getContext()
  const { name } = plugin

  if (!name) {
    throw new Error('[KEA] Tried to activate a plugin without a name!')
  }

  if (plugins.activated.find((plugin) => plugin.name === name)) {
    throw new Error(`[KEA] Tried to activate plugin "${name}", but it was already installed!`)
  }

  plugins.activated.push(plugin)

  if (plugin.buildSteps) {
    for (const key of Object.keys(plugin.buildSteps)) {
      // if redefining an existing step, add to the end of the list (no order changing possible anymore)
      if (plugins.buildSteps[key]) {
        console.error(
          `[KEA] Plugin "${plugin.name}" redefines build step "${key}". Previously defined by ${
            plugins.logicFields[key] || 'core'
          }`,
        )
        plugins.buildSteps[key].push(plugin.buildSteps[key])
      } else {
        plugins.buildSteps[key] = [plugin.buildSteps[key]]

        if (plugin.buildOrder && plugin.buildOrder[key]) {
          const { after, before } = plugin.buildOrder[key]
          const index = after || before ? plugins.buildOrder.indexOf((after || before)!) : -1

          if (after && index >= 0) {
            plugins.buildOrder.splice(index + 1, 0, key)
          } else if (before && index >= 0) {
            plugins.buildOrder.splice(index, 0, key)
          } else {
            plugins.buildOrder.push(key)
          }
        } else {
          plugins.buildOrder.push(key)
        }
      }
    }
  }

  if (plugin.defaults) {
    const fields = Object.keys(typeof plugin.defaults === 'function' ? plugin.defaults() : plugin.defaults)
    for (const key of fields) {
      if (process.env.NODE_ENV !== 'production') {
        if (plugins.logicFields[key] || (reservedKeys as any)[key]) {
          console.error(
            `[KEA] Plugin "${plugin.name}" redefines logic field "${key}". Previously defined by ${
              plugins.logicFields[key] || 'core'
            }`,
          )
        }
      }
      plugins.logicFields[key] = plugin.name
    }
  }

  if (plugin.events) {
    for (const key of Object.keys(plugin.events) as Array<keyof PluginEvents>) {
      if (!plugins.events[key]) {
        plugins.events[key] = []
      }
      plugins.events[key]!.push(plugin.events[key] as any)
    }

    plugin.events.afterPlugin && plugin.events.afterPlugin()
  }
}

type PluginParameters<T> = T extends (...args: infer P) => any ? P : never

// run plugins with this key with the rest of the arguments
export function runPlugins<T extends keyof PluginEvents, E extends PluginParameters<PluginEvents[T]>>(
  key: T,
  ...args: E
): void {
  const {
    plugins,
    options: { debug },
  } = getContext()
  if (debug) {
    console.log(`[KEA] Event: ${key}`, ...args)
  }
  if (plugins && plugins.events[key]) {
    ;(plugins.events[key] as Array<(...args: E) => void>).forEach((pluginFunction) => {
      pluginFunction(...args)
    })
  }
}
//
// runPlugins('afterWrapper', 'asd', 'we', 'we')
// runPlugins('afterBuild', 'asd', 'we')
