import { useMemo, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { mountPaths, unmountPaths } from '../kea/mount'

export function useProps(logic) {
  useMountedLogic(logic)

  let response = {}
  
  for (const key of Object.keys(logic.selectors)) {
    response[key] = useSelector(logic.selectors[key])
  }

  return response
}

export function useActions(logic) {
  useMountedLogic(logic)

  const dispatch = useDispatch()

  return useMemo(() => {
    let response = {}
  
    for (const key of Object.keys(logic.actions)) {
      response[key] = (...args) => dispatch(logic.actions[key](...args))
    }
    
    return response
  }, [dispatch])
}

export function useMountedLogic(logic) {
  const firstRender = useRef(true)
  if (firstRender.current) {
    firstRender.current = false
    mountPaths(logic)
  }
  useEffect(() => () => unmountPaths(logic), [])
}

// import { bindActionCreators } from 'redux'
// import { useDispatch } from 'react-redux'
// import { useMemo } from 'react'

// export function useActions(actions, deps) {
//   const dispatch = useDispatch()
//   return useMemo(() => {
//     if (Array.isArray(actions)) {
//       return actions.map(a => bindActionCreators(a, dispatch))
//     }
//     return bindActionCreators(actions, dispatch)
//   }, deps ? [dispatch, ...deps] : deps)
// }