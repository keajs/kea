import { kea } from './kea'
import { resetCache } from './kea/cache'
import { clearReducerCache } from './kea/reducer'
import { clearActionCache } from './kea/actions/create'
import { clearActivatedPlugins } from './kea/plugins'

export { kea } from './kea'
export { keaReducer } from './kea/reducer'
export { createAction } from './kea/actions/create'

export { getStore } from './kea/store'

// for plugins
export { getCache, setCache } from './kea/cache'
export { activatePlugin } from './kea/plugins'

export const connect = (mapping) => kea({ connect: mapping })

export function resetKeaCache () {
  resetCache()
  clearActionCache()
  clearReducerCache()
  clearActivatedPlugins()
}
