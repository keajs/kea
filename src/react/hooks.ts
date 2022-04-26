import React, { useMemo, useEffect, useRef, useContext, createContext } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { kea } from '../kea'
import { LogicInput, LogicWrapper, BuiltLogic, Logic, Selector } from '../types'
import { getContext } from '../kea/context'

/** True if we dispatched an action *while* rendering. Old subscriptions shouldn't update until after rendering. */
let pauseCounter = 0

const getStore = () => getContext().store

export function useKea(input: LogicInput, deps = []): LogicWrapper {
  return useMemo(() => kea(input), deps)
}

function subscribeUnlessPaused(onStoreChange: () => void): () => void {
  return getStore().subscribe(() => {
    if (pauseCounter === 0) {
      onStoreChange()
    }
  })
}

export function useSelector(selector: Selector): any {
  return useSyncExternalStore(subscribeUnlessPaused, () => selector(getStore().getState()))
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
  const response: Record<string, any> = {}
  for (const key of Object.keys(builtLogic.actions)) {
    response[key] = (...args: any[]) =>
      ('startTransition' in React ? React.startTransition : (a: () => void) => a())(() =>
        withPause(builtLogic.actions[key](...args)),
      )
  }
  return response
}

export function isWrapper<L extends Logic = Logic>(
  toBeDetermined: BuiltLogic<L> | LogicWrapper<L>,
): toBeDetermined is LogicWrapper<L> {
  if ((toBeDetermined as LogicWrapper)._isKea) {
    return true
  }
  return false
}

const blankContext = createContext(undefined as BuiltLogic | undefined)

export function useMountedLogic<L extends Logic = Logic>(logic: BuiltLogic<L> | LogicWrapper<L>): BuiltLogic<L> {
  const builtLogicContext = isWrapper(logic) ? getContext().react.contexts.get(logic as LogicWrapper) : null
  const defaultBuiltLogic = useContext(builtLogicContext || blankContext)
  const builtLogic = isWrapper(logic) ? defaultBuiltLogic || logic.build() : logic

  const unmount = useRef(undefined as undefined | (() => void))

  if (!unmount.current) {
    withPause(() => {
      unmount.current = builtLogic.mount()
    })
  }

  const pathString = useRef(builtLogic.pathString)

  if (pathString.current !== builtLogic.pathString) {
    withPause(() => {
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
      withPause(() => {
        unmount.current = builtLogic.mount()
        pathString.current = builtLogic.pathString
      })
    }

    return function useMountedLogicEffectCleanup() {
      withPause(() => {
        unmount.current && unmount.current()
        unmount.current = undefined
      })
    }
  }, [])

  return builtLogic as BuiltLogic<L>
}

function withPause(callback: () => void) {
  pauseCounter += 1
  try {
    callback()
  } catch (e) {}
  pauseCounter -= 1
}
