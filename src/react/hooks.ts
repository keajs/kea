import { useMemo, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { kea } from '../kea/kea'
import { LogicInput, LogicWrapper, BuiltLogic } from '../types'

export function useKea(input: LogicInput, deps = []): LogicWrapper {
  return useMemo(() => kea(input), deps)
}

export function useValues<L extends BuiltLogic | LogicWrapper>(logic: L): L['values'] {
  useMountedLogic(logic)

  return useMemo(() => {
    const response = {}

    for (const key of Object.keys(logic.selectors)) {
      Object.defineProperty(response, key, {
        get: () => useSelector(logic.selectors[key]),
      })
    }

    return response
  }, [logic.pathString])
}

export function useAllValues<L extends BuiltLogic | LogicWrapper>(logic: L): L['values'] {
  useMountedLogic(logic)

  const response: Record<string, any> = {}
  for (const key of Object.keys(logic['selectors'])) {
    response[key] = useSelector(logic['selectors'][key])
  }

  return response
}

export function useActions<L extends BuiltLogic | LogicWrapper>(logic: L): L['actions'] {
  useMountedLogic(logic)
  return logic['actions']
}

function isWrapper(toBeDetermined: BuiltLogic | LogicWrapper): toBeDetermined is LogicWrapper {
  if ((toBeDetermined as LogicWrapper)._isKea) {
    return true
  }
  return false
}

export function useMountedLogic(logic: BuiltLogic | LogicWrapper): void {
  logic = isWrapper(logic) ? logic.build() : logic

  const unmount = useRef(undefined as undefined | (() => void))

  if (!unmount.current) {
    unmount.current = logic.mount()
  }

  const pathString = useRef(logic.pathString)

  if (pathString.current !== logic.pathString) {
    unmount.current()
    unmount.current = logic.mount()
    pathString.current = logic.pathString
  }

  useEffect(() => () => unmount.current && unmount.current(), [])
}
