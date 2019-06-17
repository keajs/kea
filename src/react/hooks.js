import { useMemo, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

export function useProps (logic) {
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

export function useActions (logic) {
  useMountedLogic(logic)

  const dispatch = useDispatch()

  return useMemo(() => {
    let response = {}

    for (const key of Object.keys(logic.actions)) {
      response[key] = (...args) => dispatch(logic.actions[key](...args))
    }

    return response
  }, [dispatch, logic.pathString])
}

export function useMountedLogic (logic) {
  const unmount = useRef(undefined)
  const pathString = useRef(logic.pathString)

  if (!unmount.current) {
    unmount.current = logic.mount()
  }

  if (pathString !== logic.pathString) {
    unmount.current()
    unmount.current = logic.mount()
  }
  
  useEffect(() => unmount.current, [])
}
