import { select } from 'redux-saga/effects'
import { createSelector, createStructuredSelector } from 'reselect'
import { combineReducers } from 'redux'

class KeaLogic {
  constructor (args) {
    Object.keys(args).forEach(key => {
      this[key] = args[key]
    })
  }

  * get (key) {
    return yield select(this.selectors[key])
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

export function selectPropsFromLogic (mapping = {}) {
  let hash = {}

  Object.keys(mapping).forEach(key => {
    const selector = mapping[key].selectors ? mapping[key].selectors : mapping[key]

    if (typeof selector[key] !== 'undefined') {
      hash[key] = selector[key]
    } else {
      console.error(`[KEA-LOGIC] selector ${key} missing`)
      console.trace()
    }
  })

  return createStructuredSelector(hash)
}

class KeaScene {
  constructor (logics) {
    this.logics = logics
    this.reducer = createCombinedReducer(logics)
  }
}

export function createScene (args) {
  return new KeaScene(args)
}
