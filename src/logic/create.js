import { select } from 'redux-saga/effects'
import { createSelector } from 'reselect'

import { combineReducerObjects, convertReducerArrays } from './reducer'
import { pathSelector, createSelectors } from './selectors'
import { createActions } from './actions'

let deprecationWarning = false

// convert ['A', 'B'] ==> { 'A': 'A', 'B': 'B' }
export function convertConstants (c) {
  if (Array.isArray(c)) {
    let a = {}
    for (let i = 0; i < c.length; i++) {
      a[c[i]] = c[i]
    }
    return a
  }
  return c
}

export function createLogic (_this, object = {}) {
  if (process.env.NODE_ENV !== 'production') {
    if (!deprecationWarning) {
      deprecationWarning = true
      console.warn('[KEA/LOGIC] Logic classes and createLogic have been deprecated! Please upgrade to the new kea({}) format! See https://kea.js.org/')
    }
  }

  object.key = _this.key ? _this.key(object.props || {}) : undefined
  object.path = _this.path(object.key)
  object.selector = (state) => pathSelector(object.path, state)
  object.constants = _this.constants ? convertConstants(_this.constants(object)) : {}
  object.actions = _this.actions ? createActions(_this.actions(object), object.path) : {}

  // reducers
  if (_this.reducers) {
    object.reducers = convertReducerArrays(_this.reducers(object))
  } else {
    object.reducers = {}
  }

  object.reducer = _this.reducer ? _this.reducer(object) : combineReducerObjects(object.path, object.reducers)

  object.selectors = createSelectors(object.path, Object.keys(object.reducers))

  // selectors
  // TODO: remove addSelector deprecation
  let response = _this.selectors ? _this.selectors(object) : {}

  if (typeof response === 'object') {
    const keys = Object.keys(response)
    for (let i = 0; i < keys.length; i++) {
      const s = response[keys[i]]
      // s == [() => args, selectorFunction, propType]

      const args = s[0]()
      if (s[2]) {
        object.reducers[keys[i]] = { type: s[2] }
      }
      object.selectors[keys[i]] = createSelector(...args, s[1])
    }
  }

  Object.assign(_this, object)

  _this.get = function * (key) {
    return yield select(key ? _this.selectors[key] : _this.selector)
  }

  _this.fetch = function * () {
    let results = {}

    const keys = Array.isArray(arguments[0]) ? arguments[0] : arguments

    for (let i = 0; i < keys.length; i++) {
      results[keys[i]] = yield _this.get(keys[i])
    }

    return results
  }

  return _this
}
