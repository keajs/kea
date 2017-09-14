import { kea } from './kea'
import { resetCache } from './kea/cache'
import { clearActionCache } from './logic/actions'
import { clearStore } from './scene/store'

export { kea } from './kea'
export { createAction } from './logic/actions'
export { keaReducer, keaSaga } from './scene/store'

export const connect = (mapping) => kea({ connect: mapping })

export function resetKeaCache () {
  resetCache()
  clearActionCache()
  clearStore()
}
