import { useMemo, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { kea } from '../kea/kea'

export function useKea (input, deps = []) {
  return useMemo(() => kea(input), deps)
}

export function useValues (logic) {
  useMountedLogic(logic)

  return useMemo(() => {
    let response = {}

    for (const key of Object.keys(logic.selectors)) {
      Object.defineProperty(response, key, {
        get: () => useSelector(logic.selectors[key])
      })
    }

    return response
  }, [logic.pathString])
}

export function useAllValues (logic) {
  useMountedLogic(logic)

  let response = {}
  for (const key of Object.keys(logic.selectors)) {
    response[key] = useSelector(logic.selectors[key])
  }

  return response
}

export function useActions (logic) {
  useMountedLogic(logic)

  const dispatch = useDispatch()

  return useMemo(() => {
    let response = {}

    for (const key of Object.keys(logic.actionCreators)) {
      const actionCreator = logic.actionCreators[key]
      response[key] = (...args) => dispatch(actionCreator(...args))
    }

    return response
  }, [dispatch, logic.pathString])
}

export function useMountedLogic (logic) {
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
