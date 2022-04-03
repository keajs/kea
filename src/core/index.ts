import { KeaPlugin } from '../types'
import { listeners } from './listeners'
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
    reducers: {},
    reducer: undefined,
    selector: undefined,
    selectors: {},
    values: {},
    events: {},
  }),

  events: {
    legacyBuild: (logic, input) => {
      'props' in input && props(input.props)(logic)
      'key' in input && input.key && key(input.key)(logic)
      'path' in input && input.path && path(input.path)(logic)
      'actions' in input && input.actions && actions(input.actions)(logic)
      'defaults' in input && input.defaults && defaults(input.defaults)(logic)
      'reducers' in input && input.reducers && reducers(input.reducers)(logic)
      'selectors' in input && input.selectors && selectors(input.selectors)(logic)
      'events' in input && input.events && events(input.events)(logic)
    },
  },
}
