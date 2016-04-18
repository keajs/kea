import { select, take, fork, cancel } from 'redux-saga/effects'
import { createSelector, createStructuredSelector } from 'reselect'
import { combineReducers } from 'redux'

class KeaLogic {
  // path,
  // actions
  // constants
  // saga
  // reducer
  // selectors
  constructor (args) {
    Object.keys(args).forEach(key => {
      this[key] = args[key]
    })

    if (!this.selector && this.path) {
      this.selector = (state) => pathSelector(this.path, state)
    }
  }

  * get (key) {
    return yield select(key ? this.selectors[key] : this.selector)
  }

  * fetch () {
    let results = {}

    const keys = Array.isArray(arguments[0]) ? arguments[0] : arguments

    for (let i = 0; i < keys.length; i++) {
      results[keys[i]] = yield this.get(keys[i])
    }

    return results
  }
}

export function createLogic (args) {
  return new KeaLogic(args)
}

export function pathSelector (path, state) {
  return ([state]).concat(path).reduce((v, a) => v[a])
}

export function createSelectors (path, reducer, additional = {}) {
  const selector = (state) => pathSelector(path, state)
  const keys = Object.keys(reducer())

  let selectors = {
    root: selector
  }

  keys.forEach(key => {
    selectors[key] = createSelector(selector, state => state[key])
  })

  return Object.assign(selectors, additional)
}

export function createCombinedReducer (logics = []) {
  let reducer = {}

  logics.forEach(logic => {
    if (!logic.path) {
      console.error('[KEA-LOGIC] No path found for reducer!', logic)
      console.trace()
      return
    }
    if (!logic.reducer) {
      console.error('[KEA-LOGIC] No reducer in logic!', logic.path, logic)
      console.trace()
      return
    }
    reducer[logic.path[logic.path.length - 1]] = logic.reducer
  })

  return combineReducers(reducer)
}

export function selectPropsFromLogic (mapping = []) {
  if (mapping.length % 2 === 1) {
    console.error('[KEA-LOGIC] uneven mapping given to selectPropsFromLogic:', mapping)
    console.trace()
    return
  }

  let hash = {}

  for (let i = 0; i < mapping.length; i += 2) {
    const logic = mapping[i]
    const props = mapping[i + 1]

    const selectors = logic.selectors ? logic.selectors : logic

    props.forEach(query => {
      let from = query
      let to = query

      if (query.includes(' as ')) {
        [from, to] = query.split(' as ')
      }

      if (from === '*') {
        hash[to] = logic.selector ? logic.selector : selectors
      } else if (typeof selectors[from] !== 'undefined') {
        hash[to] = selectors[from]
      } else {
        console.error(`[KEA-LOGIC] selector "${query}" missing for logic:`, logic)
        console.trace()
      }
    })
  }

  return createStructuredSelector(hash)
}

export function createCombinedSaga (sagas) {
  return function * () {
    let workers = []
    try {
      for (let i = 0; i < sagas.length; i++) {
        const worker = yield fork(sagas[i])
        workers.push(worker)
      }

      while (true) {
        yield take('wait until worker cancellation')
      }
    } catch (error) {
      for (let i = 0; i < workers.length; i++) {
        yield cancel(workers[i])
      }
    }
  }
}

class KeaScene {
  constructor ({ name, logic, sagas, component }) {
    this.name = name
    this.logic = logic || []
    this.reducer = createCombinedReducer(logic)
    this.sagas = sagas
    this.component = component

    if (this.sagas) {
      this.worker = createCombinedSaga(this.sagas)
    }
  }
}

export function createScene (args) {
  return new KeaScene(args)
}

function lazyLoad (store, lazyLoadableModule) {
  return (location, cb) => {
    lazyLoadableModule(module => {
      const scene = module.default
      store.addKeaScene(scene)
      cb(null, scene.component)
    })
  }
}

export function getRoutes (App, store, routes) {
  return {
    component: App,
    childRoutes: Object.keys(routes).map(route => ({
      path: route,
      getComponent: lazyLoad(store, routes[route])
    }))
  }
}

export function combineScenesAndRoutes (scenes, routes) {
  let combined = {}

  Object.keys(routes).forEach(route => {
    if (scenes[routes[route]]) {
      combined[route] = scenes[routes[route]]
    } else {
      console.error(`[KEA-LOGIC] scene ${routes[route]} not found in scenes object (route: ${route})`)
    }
  })

  return combined
}
