import { CreateStoreOptions, KeaPlugin } from '../types'
import { listeners, ListenersPluginContext, sharedListeners } from './listeners'
import { getPluginContext, setPluginContext } from '../kea/context'
import { connect } from './connect'
import { actions } from './actions'
import { defaults } from './defaults'
import { reducers } from './reducers'
import { selectors } from './selectors'
import { events } from './events'
import { props } from './props'
import { key } from './key'
import { path } from './path'

export { actions } from './actions'
export { connect } from './connect'
export { defaults } from './defaults'
export { events, afterMount, beforeUnmount } from './events'
export { listeners } from './listeners'
export { reducers } from './reducers'
export { selectors } from './selectors'
export { key } from './key'
export { props } from './props'
export { path } from './path'

export const corePlugin: KeaPlugin = {
  name: 'core',

  defaults: () => ({
    actionCreators: {},
    actionKeys: {},
    actionTypes: {},
    actions: {},
    cache: {},
    connections: {},
    defaults: {},
    listeners: undefined,
    reducers: {},
    reducer: undefined,
    selector: undefined,
    selectors: {},
    sharedListeners: undefined,
    values: {},
    events: {},
  }),

  events: {
    afterPlugin(): void {
      setPluginContext<ListenersPluginContext>('listeners', { byAction: {}, byPath: {}, pendingPromises: new Map() })
    },

    beforeReduxStore(options: CreateStoreOptions): void {
      options.middleware.push((store) => (next) => (action) => {
        const previousState = store.getState()
        const response = next(action)
        const { byAction } = getPluginContext<ListenersPluginContext>('listeners')
        const listeners = byAction[action.type]
        if (listeners) {
          for (const listenerArray of Object.values(listeners)) {
            for (const innerListener of listenerArray) {
              innerListener(action, previousState)
            }
          }
        }
        return response
      })
    },

    legacyBuild: (logic, input) => {
      'props' in input && props(input.props)(logic)
      'key' in input && input.key && key(input.key)(logic)
      'path' in input && input.path && path(input.path)(logic)
      'connect' in input && input.connect && connect(input.connect)(logic)
      'actions' in input && input.actions && actions(input.actions)(logic)
      'defaults' in input && input.defaults && defaults(input.defaults)(logic)
      'reducers' in input && input.reducers && reducers(input.reducers)(logic)
      'selectors' in input && input.selectors && selectors(input.selectors)(logic)
      'sharedListeners' in input && sharedListeners(input.sharedListeners)(logic)
      'listeners' in input && input.listeners && listeners(input.listeners)(logic)
      'events' in input && input.events && events(input.events)(logic)
    },
  },
}
