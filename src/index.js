import { kea } from './kea'
import { clearActionCache } from './logic/actions'
import { clearStore } from './scene/store'
import { clearRunningSagas } from './scene/saga'

export { kea } from './kea'
export { createAction } from './logic/actions'
export { keaReducer, keaSaga } from './scene/store'

export const connect = (mapping) => kea({ connect: mapping })

export function resetKeaCache () {
  clearActionCache()
  clearStore()
  clearRunningSagas()
}
