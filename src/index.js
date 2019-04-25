// TODO:
// 1+ convert kea input structure to actions, reducers and selectors
// 2+ skip the step of doing it twice, both before and after connection
// 3+ have something easy to hook up to redux
// 4. typescript support?
// 5+ easy to use plugins
// 6. connect giving nicer output with prettier
// 7- could precalculate data, e.g. with prepack?
// 8+ exactly the same code for withkey or without
// 9+ track mounting and unmounting of logic stores
// 0. set proptypes on the component

// 1.0 todo
// + set proptypes on the component
// + .withKey
// . merge logic
// . lazy mode cleanup
// . listeners plugin
// . mount & pre
// . can initialize without a store?

import { resetKeaLogicCache } from './kea'
import { clearReducerCache } from './store'
import { clearActivatedPlugins } from './plugins'

export { kea, connect } from './kea'
export { keaReducer, getStore, ATTACH_REDUCER } from './store'
export { activatePlugin } from './plugins'
export { createAction } from './logic/actions'

export function resetKeaCache () {
  resetKeaLogicCache()
  clearReducerCache()
  clearActivatedPlugins()
}
