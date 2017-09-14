import { kea } from './kea'
import { resetCache } from './kea/cache'
import { clearActionCache } from './logic/actions'
import { clearReducerCache } from './kea/reducer'

export { kea } from './kea'
export { keaReducer } from './kea/reducer'
export { keaSaga } from './kea/saga'

export { createAction } from './logic/actions'

export const connect = (mapping) => kea({ connect: mapping })

export function resetKeaCache () {
  resetCache()
  clearActionCache()
  clearReducerCache()
}
