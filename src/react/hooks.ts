import { useMemo, useEffect, useRef, useContext, createContext } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { LogicWrapper, BuiltLogic, Logic, Selector } from '../types'
import { getContext } from '../kea/context'
import { isLogicWrapper } from '../utils'

/** True if we dispatched an action in a component's body *while* rendering. For example when mounting a logic.
 * Old subscriptions shouldn't update until after rendering. */
export let pauseCounter = 0
export const isPaused = () => pauseCounter !== 0

const getStoreState = () => getContext().store.getState()

export function useSelector(selector: Selector): any {
  return useSyncExternalStore(getContext().store.subscribe, () => selector(getStoreState()))
}

export function useValues<L extends Logic = Logic>(logic: BuiltLogic<L> | LogicWrapper<L>): L['values'] {
  const builtLogic = useMountedLogic(logic)

  return useMemo(() => {
    const response = {}

    for (const key of Object.keys(builtLogic.selectors)) {
      Object.defineProperty(response, key, {
        get: () => useSelector(builtLogic.selectors[key]),
      })
    }

    return response
  }, [builtLogic.pathString])
}

export function useAllValues<L extends Logic = Logic>(logic: BuiltLogic<L> | LogicWrapper<L>): L['values'] {
  const builtLogic = useMountedLogic(logic)

  const response: Record<string, any> = {}
  for (const key of Object.keys(builtLogic.selectors)) {
    response[key] = useSelector(builtLogic.selectors[key])
  }

  return response
}

export function useActions<L extends Logic = Logic>(logic: BuiltLogic<L> | LogicWrapper<L>): L['actions'] {
  const builtLogic = useMountedLogic(logic)
  return builtLogic['actions']
}

const blankContext = createContext(undefined as BuiltLogic | undefined)

export function useMountedLogic<L extends Logic = Logic>(logic: BuiltLogic<L> | LogicWrapper<L>): BuiltLogic<L> {
  const builtLogicContext = isLogicWrapper(logic) ? getContext().react.contexts.get(logic) : null
  const defaultBuiltLogic = useContext(builtLogicContext || blankContext)
  const builtLogic = isLogicWrapper(logic) ? defaultBuiltLogic || logic.build() : logic

  const unmount = useRef(undefined as undefined | (() => void))

  if (!unmount.current) {
    batchChanges(() => {
      unmount.current = builtLogic.mount()
    })
  }

  const pathString = useRef(builtLogic.pathString)

  if (pathString.current !== builtLogic.pathString) {
    batchChanges(() => {
      unmount.current?.()
      unmount.current = builtLogic.mount()
      pathString.current = builtLogic.pathString
    })
  }

  useEffect(function useMountedLogicEffect() {
    // React Fast Refresh calls `useMountedLogicEffectCleanup` followed directly by `useMountedLogicEffect`.
    // Thus if we're here and there's still no `unmount.current`, it's because we just refreshed.
    // Normally we still mount the logic sync in the component, just to have the data there when selectors fire.
    if (!unmount.current) {
      batchChanges(() => {
        unmount.current = builtLogic.mount()
        pathString.current = builtLogic.pathString
      })
    }

    return function useMountedLogicEffectCleanup() {
      batchChanges(() => {
        unmount.current && unmount.current()
        unmount.current = undefined
      })
    }
  }, [])

  return builtLogic as BuiltLogic<L>
}

let timeout: number
/** Delay Redux subscriptions from firing and asking React to re-render.
 * Will set a Timeout to flush if store changed during callback. */
export function batchChanges(callback: () => void) {
  const previousState = getStoreState()
  pauseCounter += 1
  try {
    callback()
  } catch (e) {
  } finally {
    pauseCounter -= 1
  }
  const newState = getStoreState()
  if (previousState !== newState) {
    timeout && window.clearTimeout(timeout)
    timeout = window.setTimeout(() => getContext().store.dispatch({ type: '@KEA/FLUSH' }), 0)
  }
}
