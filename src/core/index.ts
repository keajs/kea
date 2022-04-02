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
    cache: {},
    connections: {},
    actionCreators: {},
    actionKeys: {},
    actionTypes: {},
    actions: {},
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
      input.props && props(input.props)(logic)
      input.key && key(input.key)(logic)
      input.path && path(input.path)(logic)
      input.actions && actions(input.actions)(logic)
      input.defaults && defaults(input.defaults)(logic)
      input.reducers && reducers(input.reducers)(logic)
      input.selectors && selectors(input.selectors)(logic)
      input.events && events(input.events)(logic)
    },
  },
}
