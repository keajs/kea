// TODO:
// 1. convert kea input structure to actions, reducers and selectors
// 2. skip the step of doing it twice, both before and after connection
// 3. have something easy to hook up to redux
// 4. typescript support?
// 5. easy to use plugins
// 6. connect working with prettier
// 7. could precalculate data?
// 8. exactly the same code for withkey or without

import { resetKeaLogicCache } from './kea'
import { clearReducerCache } from './store'

export { kea } from './kea'
export { keaReducer } from './store'

export function resetKeaCache () {
  resetKeaLogicCache()
  clearReducerCache()
}
