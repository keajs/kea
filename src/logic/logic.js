import { select } from 'redux-saga/effects'
import { createSelector } from 'reselect'

import { combineReducerObjects, convertReducerArrays } from './reducer'
import { pathSelector, createSelectors } from './selectors'
import { createActions } from './actions'

let gaveAddSelectorWarning = false
let gaveStructureWarning = false

// convert ['A', 'B'] ==> { 'A': 'A', 'B': 'B' }
function convertConstants (c) {
  if (Array.isArray(c)) {
    let a = {}
    for (let i = 0; i < c.length; i++) {
      a[c[i]] = c[i]
    }
    return a
  }
  return c
}

export function initLogic (Klass) {
  return new Klass().init()
}

class Logic {
  path = () => []
  selector = (state) => state
  constants = () => ({})
  actions = () => ({})
  reducers = () => ({})
  reducer = ({ path, reducers }) => combineReducerObjects(path, reducers)
  selectors = ({ selectors }) => ({})

  init () {
    let object = {}

    object.path = this.path()
    object.selector = (state) => pathSelector(object.path, state)
    object.constants = convertConstants(this.constants(object))
    object.actions = createActions(this.actions(object), object.path)

    // reducers
    if (this.structure) {
      // DEPRECATED
      if (!gaveStructureWarning) {
        console.warn(`[KEA-LOGIC] structure = () => ({}) is deprecated. Please rename it to reducers = () => ({}).`)
        gaveStructureWarning = true
      }
      object.reducers = convertReducerArrays(this.structure(object))
    } else {
      object.reducers = convertReducerArrays(this.reducers(object))
    }
    object.reducer = this.reducer(object)

    object.selectors = createSelectors(object.path, Object.keys(object.reducers))

    // selectors
    // TODO: remove addSelector deprecation
    let response = this.selectors({...object, addSelector: object::this._addSelector})

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

    Object.assign(this, object)

    return this
  }

  // DEPRECATED
  _addSelector (name, type, args, func) {
    if (!gaveAddSelectorWarning) {
      console.warn(`[KEA-LOGIC] addSelector is deprecated. Please use the new compact Array format.`)
      gaveAddSelectorWarning = true
    }

    this.reducers[name] = { type }
    this.selectors[name] = createSelector(...args, func)
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

Logic._isKeaLogicClass = true

export default Logic
