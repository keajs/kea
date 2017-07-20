import { kea } from './logic'
export { kea, createAction } from './logic'
export { keaReducer, keaSaga } from './scene'

export const connect = (mapping) => kea({ connect: mapping })
