
import { clearMountedPaths } from './kea/mount'
import { clearLogicCache } from './logic'
import { clearReducerCache } from './store/reducer'
import { clearActivatedPlugins } from './plugins'

export function resetKeaCache () {
  clearMountedPaths()
  clearLogicCache()
  clearReducerCache()
  clearActivatedPlugins()
}
