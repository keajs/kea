import { kea } from './logic/kea'

export { kea } from './logic/kea'
export { createAction } from './logic/actions'
export { keaReducer, keaSaga } from './scene/store'

export const connect = (mapping) => kea({ connect: mapping })
