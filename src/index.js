import { kea } from './logic'
export { kea, createLogic } from './logic'
export { createSaga } from './saga'
export { keaReducer, keaSaga } from './scene'

export const connect = (mapping) => kea({ connect: mapping })
