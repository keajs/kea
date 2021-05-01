export * from './types'

import { resetContext } from './context'

export { kea, connect } from './kea'

export { useValues, useAllValues, useActions, useMountedLogic, useKea } from './react/hooks'
export { BindLogic } from './react/bind'
export { Provider } from './react/provider'

export { resetContext, openContext, closeContext, getContext, getPluginContext, setPluginContext } from './context'
export { getStore } from './store/store'
export { keaReducer } from './store/reducer'
export { activatePlugin } from './plugins'

export { createAction } from './core/shared/actions'
export { addConnection } from './core/shared/connect'
export { isBreakpoint } from './listeners'

// Must do this to make TSD happy, as otherwise rollup+dts produces an invalid .d.ts file
import { ATTACH_REDUCER as A, DETACH_REDUCER as D } from './store/reducer'
export const ATTACH_REDUCER = A as '@KEA/ATTACH_REDUCER'
export const DETACH_REDUCER = D as '@KEA/DETACH_REDUCER'

// this will create a default context
resetContext({}, true)
