export * from './types'

import { resetContext } from './context'

export { kea, connect } from './kea'
export { useValues, useAllValues, useActions, useMountedLogic, useKea } from './react/hooks'

export { resetContext, openContext, closeContext, getContext, getPluginContext, setPluginContext } from './context'
export { keaReducer, getStore, ATTACH_REDUCER, DETACH_REDUCER } from './store'
export { activatePlugin } from './plugins'

export { createAction } from './core/shared/actions'
export { addConnection } from './core/shared/connect'
export { isBreakpoint } from './listeners'

// this will create a default context
resetContext()
