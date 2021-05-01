import { useMemo, useEffect, useRef, useContext, createContext } from 'react'
import { useSelector } from 'react-redux'

import { kea } from '../kea/kea'
import { LogicInput, LogicWrapper, BuiltLogic } from '../types'
import { getContext } from '../context'

export function useKea(input: LogicInput, deps = []): LogicWrapper {
  return useMemo(() => kea(input), deps)
}

export function useValues<L extends BuiltLogic | LogicWrapper>(logic: L): L['values'] {
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

export function useAllValues<L extends BuiltLogic | LogicWrapper>(logic: L): L['values'] {
  const builtLogic = useMountedLogic(logic)

  const response: Record<string, any> = {}
  for (const key of Object.keys(builtLogic['selectors'])) {
    response[key] = useSelector(builtLogic['selectors'][key])
  }

  return response
}

export function useActions<L extends BuiltLogic | LogicWrapper>(logic: L): L['actions'] {
  const builtLogic = useMountedLogic(logic)
  return builtLogic['actions']
}

export function isWrapper(toBeDetermined: BuiltLogic | LogicWrapper): toBeDetermined is LogicWrapper {
  if ((toBeDetermined as LogicWrapper)._isKea) {
    return true
  }
  return false
}

const blankContext = createContext(undefined as BuiltLogic | undefined)

export function useMountedLogic(logic: BuiltLogic | LogicWrapper): BuiltLogic {
  const builtLogicContext = isWrapper(logic) ? getContext().react.contexts.get(logic as LogicWrapper) : null
  const defaultBuiltLogic = useContext(builtLogicContext || blankContext)
  const builtLogic = isWrapper(logic) ? defaultBuiltLogic || logic.build() : logic

  const unmount = useRef(undefined as undefined | (() => void))

  if (!unmount.current) {
    unmount.current = builtLogic.mount()
  }

  const pathString = useRef(builtLogic.pathString)

  if (pathString.current !== builtLogic.pathString) {
    unmount.current()
    unmount.current = builtLogic.mount()
    pathString.current = builtLogic.pathString
  }

  useEffect(function useMountedLogicEffect () {
    // React Fast Refresh calls `useMountedLogicEffectCleanup` followed directly by `useMountedLogicEffect`.
    // Thus if we're here and there's still no `unmount.current`, it's because we just refreshed.
    // Normally we still mount the logic sync in the component, just to have the data there when selectors fire.
    if (!unmount.current) {
      unmount.current = builtLogic.mount()
      pathString.current = builtLogic.pathString
    }

    return function useMountedLogicEffectCleanup() {
      unmount.current && unmount.current()
      unmount.current = undefined
    }
  }, [])

  return builtLogic
}
