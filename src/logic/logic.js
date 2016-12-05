import { select } from 'redux-saga/effects'
import { createSelector } from 'reselect'

import { createStructureReducer } from './reducer'
import { pathSelector, createSelectors } from './selectors'
import { createActions } from './actions'

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
    object.structure = this.structure(object)
    object.reducer = this.reducer(object)
    object.selectors = createSelectors(object.path, object.structure)

    this.selectors({...object, addSelector: object::this.addSelector})

    Object.assign(this, object)

    return this
  }

  addSelector (name, type, args, func) {
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
