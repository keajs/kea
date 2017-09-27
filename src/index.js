import { kea } from './kea'
import { resetCache } from './kea/cache'
import { clearReducerCache } from './kea/reducer'
import { clearActionCache } from './kea/actions/create'

export { kea } from './kea'
export { keaReducer } from './kea/reducer'
export { keaSaga } from './kea/saga'
export { createAction } from './kea/actions/create'

export const connect = (mapping) => kea({ connect: mapping })

export function resetKeaCache () {
  resetCache()
  clearActionCache()
  clearReducerCache()
}
