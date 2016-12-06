import { select } from 'redux-saga/effects'
import { createSelector } from 'reselect'

import { createStructureReducer } from './reducer'
import { pathSelector, createSelectors } from './selectors'
import { createActions } from './actions'
import { convertStructureArrays } from './structure'

let gaveWarning = false

export default class Logic {
  path = () => []
  selector = (state) => state
  constants = () => ({})
  actions = () => ({})
  structure = () => ({})
  reducer = ({ path, structure }) => createStructureReducer(path, structure)
  selectors = ({ selectors }) => (selectors)

  init () {
    let object = {}
    object.path = this.path()
    object.selector = (state) => pathSelector(object.path, state)
    object.constants = this.constants(object)
    object.actions = createActions(this.actions(object), object.path)
    object.structure = convertStructureArrays(this.structure(object))
    object.reducer = this.reducer(object)
    object.selectors = createSelectors(object.path, object.structure)

    // create the custom selectors
    let response = this.selectors({...object, addSelector: object::this.addSelector})

    if (typeof response === 'object') {
      const keys = Object.keys(response)
      for (let i = 0; i < keys.length; i++) {
        const s = response[keys[i]]

        // s[0]() == [type, args]
        const a = s[0]()

        object.structure[keys[i]] = { type: a.shift() }
        object.selectors[keys[i]] = createSelector(...a, s[1])
      }
    }

    Object.assign(this, object)

    return this
  }

  addSelector (name, type, args, func) {
    if (!gaveWarning) {
      console.warn(`[KEA-LOGIC] addSelector is deprecated. Please use the new compact Array format.`)
      gaveWarning = true
    }

    this.structure[name] = { type }
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
