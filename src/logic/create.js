import { select } from 'redux-saga/effects'
import { createSelector } from 'reselect'

import { combineReducerObjects, convertReducerArrays } from './reducer'
import { pathSelector, createSelectors } from './selectors'
import { createActions } from './actions'

let gaveAddSelectorWarning = false
let gaveStructureWarning = false

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
  object.key = _this.key ? _this.key(object.props || {}) : undefined
  object.path = _this.path(object.key)
  object.selector = (state) => pathSelector(object.path, state)
  object.constants = _this.constants ? convertConstants(_this.constants(object)) : {}
  object.actions = _this.actions ? createActions(_this.actions(object), object.path) : {}

  // reducers
  if (_this.structure) {
    // DEPRECATED
    if (!gaveStructureWarning) {
      console.warn(`[KEA-LOGIC] structure = () => ({}) is deprecated. Please rename it to reducers = () => ({}).`)
      gaveStructureWarning = true
    }
    object.reducers = convertReducerArrays(_this.structure(object))
  } else if (_this.reducers) {
    object.reducers = convertReducerArrays(_this.reducers(object))
  } else {
    object.reducers = {}
  }

  object.reducer = _this.reducer ? _this.reducer(object) : combineReducerObjects(object.path, object.reducers)

  object.selectors = createSelectors(object.path, Object.keys(object.reducers))

  // selectors
  // TODO: remove addSelector deprecation
  let response = _this.selectors({...object, addSelector: _addSelector.bind(object)})

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

// DEPRECATED
// bound to object
function _addSelector (name, type, args, func) {
  if (!gaveAddSelectorWarning) {
    console.warn(`[KEA-LOGIC] addSelector is deprecated. Please use the new compact Array format.`)
    gaveAddSelectorWarning = true
  }

  this.reducers[name] = { type }
  this.selectors[name] = createSelector(...args, func)
}
