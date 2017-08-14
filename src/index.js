import { kea } from './kea'

export { kea } from './kea'
export { createAction } from './logic/actions'
export { keaReducer, keaSaga } from './scene/store'

export const connect = (mapping) => kea({ connect: mapping })
