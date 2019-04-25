// 1.0 todo
// . merge logic
// . lazy mode cleanup
// . listeners plugin
// . mount & pre
// . can initialize without a store?

import { clearMountedPaths } from './kea'
import { clearLogicCache } from './logic'
import { clearReducerCache } from './store'
import { clearActivatedPlugins } from './plugins'

export { kea, connect } from './kea'
export { getMountedLogic, getMountPathCounter } from './kea/mount'
export { keaReducer, getStore, ATTACH_REDUCER } from './store'
export { activatePlugin } from './plugins'
export { createAction } from './logic/actions'

export function resetKeaCache () {
  clearMountedPaths()
  clearLogicCache()
  clearReducerCache()
  clearActivatedPlugins()
}
