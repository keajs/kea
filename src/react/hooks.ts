import { useMemo, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { kea } from '../kea/kea'
import { Input, Logic, LogicWrapper } from '../types'

export function useKea(input: Input, deps = []): LogicWrapper {
  return useMemo(() => kea(input), deps)
}

export function useValues<L extends Logic>(logic: L) {
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

export function useAllValues<L extends Logic>(logic: L) {
  useMountedLogic(logic)

  const response = {}
  for (const key of Object.keys(logic['selectors'])) {
    response[key] = useSelector(logic['selectors'][key])
  }

  return response
}

export function useActions<L extends Logic>(logic: L) {
  useMountedLogic(logic)
  return logic['actions']
}

function isWrapper(toBeDetermined: Logic | LogicWrapper): toBeDetermined is LogicWrapper {
  if ((toBeDetermined as LogicWrapper)._isKea) {
    return true
  }
  return false
}

export function useMountedLogic(logic: Logic | LogicWrapper): void {
  logic = isWrapper(logic) ? logic.build() : logic

  const unmount = useRef(undefined)

  if (!unmount.current) {
    unmount.current = logic.mount()
  }

  const pathString = useRef(logic.pathString)

  if (pathString.current !== logic.pathString) {
    unmount.current()
    unmount.current = logic.mount()
    pathString.current = logic.pathString
  }

  useEffect(() => () => unmount.current(), [])
}
