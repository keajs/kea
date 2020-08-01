export * from './types'

import { resetContext } from './context/index'

export { kea, connect } from './kea/index'
export { useValues, useAllValues, useActions, useMountedLogic, useKea } from './react/hooks'

export { resetContext, openContext, closeContext, getContext, getPluginContext, setPluginContext } from './context/index'
export { getStore } from './store/store'
export { keaReducer, ATTACH_REDUCER, DETACH_REDUCER } from './store/reducer'
export { activatePlugin } from './plugins/index'

export { createAction } from './core/shared/actions'
export { addConnection } from './core/shared/connect'
export { isBreakpoint } from './listeners/index'

// this will create a default context
resetContext()
