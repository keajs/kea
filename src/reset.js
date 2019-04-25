
import { clearMountedPaths } from './kea'
import { clearLogicCache } from './logic'
import { clearReducerCache } from './store'
import { clearActivatedPlugins } from './plugins'

export function resetKeaCache () {
  clearMountedPaths()
  clearLogicCache()
  clearReducerCache()
  clearActivatedPlugins()
}
