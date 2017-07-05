import { createPropTransforms, propTypesFromMapping } from './props'
import { createActions, createActionTransforms } from './actions'
import { combineReducerObjects, convertReducerArrays } from './reducer'
import { convertConstants } from './create'
import { pathSelector, createSelectors } from './selectors'
import { createSelector } from 'reselect'

import { connectAdvanced } from 'react-redux'

let inlineCache = {}

export function inline (_this) {
  return function (Klass) {
    // createLogic(_this, )
    let object = {}

    // object.key = _this.key ? _this.key(object.props || {}) : undefined
    // pregenerate as many things as we can
    object.path = _this.path('').filter(p => p)
    object.constants = _this.constants ? convertConstants(_this.constants(object)) : {}
    object.actions = _this.actions ? createActions(_this.actions(object), object.path) : {}

    const reducerObject = _this.reducers ? _this.reducers(object) : {}
    object.reducers = convertReducerArrays(reducerObject)
    object.reducerDefaults = {}
    Object.keys(reducerObject).forEach(key => {
      object.reducerDefaults[key] = reducerObject[key].value
    })

    object.reducer = _this.reducer ? _this.reducer(object) : combineReducerObjects(false, object.reducers)

    // TODO: give all of this to kea so that it can start creating objects of this type
    // TODO: add propTypes from selectors to reducers
    // if (mapping.props) {
    //   Klass.propTypes = Object.assign({}, propTypesFromMapping(mapping), Klass.propTypes || {})
    // }

    // convert this.props.actions to this.actions
    const originalComponentWillMount = Klass.prototype.componentWillMount
    Klass.prototype.componentWillMount = function () {
      this.actions = this.props.actions
      originalComponentWillMount.bind(this)()
    }

    const mapping = _this.connect || {}

    const actionTransforms = createActionTransforms(mapping.actions)
    const propTransforms = createPropTransforms(mapping.props)

    const selectorFactory = (dispatch, options) => (state, props) => {
      const key = _this.key ? _this.key(props) : 'index'

      if (typeof key === 'undefined') {
        console.error(`"key" can't be undefined in path: ${_this.path('undefined').join('.')}`)
      }

      const path = _this.path(key)
      const joinedPath = path.join('.')

      console.log(`Inline selectorFactory for ${joinedPath}`)
      console.log({ props, state, key, path })

      // is the reducer created
      let reducerCreated = true
      try {
        const object = selector(state)
        if (typeof object !== 'undefined') {
          reducerCreated = false
        }
      } catch (e) {
        reducerCreated = false
      }

      let selector
      let selectors

      if (reducerCreated && inlineCache[joinedPath]) {
        selector = inlineCache[joinedPath].selector
        selectors = inlineCache[joinedPath].selectors
      } else {
        selector = (state) => pathSelector(path, state)

        if (reducerCreated) {
          selectors = createSelectors(path, Object.keys(object.reducers))
        } else {
          selectors = {}
          Object.keys(object.reducers).forEach(key => {
            selectors[key] = () => object.reducerDefaults[key]
          })
        }

        const selectorResponse = _this.selectors ? _this.selectors(Object.assign({}, object, { selectors, key })) : {}

        Object.keys(selectorResponse).forEach(selectorKey => {
          const s = selectorResponse[selectorKey]
          // s == [() => args, selectorFunction, propType]

          const args = s[0]()
          // TODO: move this one level up
          // if (s[2]) {
          //   object.reducers[selectorKey] = { type: s[2] }
          // }
          selectors[selectorKey] = createSelector(...args, s[1])
        })

        inlineCache[joinedPath] = {
          selector,
          selectors
        }
      }

      console.log({ selector, selectors })

      let actions = {}

      // pass conneted actions as is
      Object.keys(actionTransforms.actions).forEach(actionKey => {
        actions[actionKey] = (...args) => dispatch(actionTransforms.actions[actionKey](...args))
      })

      // inject key to the payload of inline actions
      Object.keys(object.actions).forEach(actionKey => {
        actions[actionKey] = (...args) => {
          const createdAction = object.actions[actionKey](...args)
          return dispatch({
            ...createdAction,
            payload: {
              key,
              ...createdAction[createdAction.payload]
            }
          })
        }
      })

      console.log({ actions })

      let newProps = {}

      // connected props
      Object.keys(propTransforms.selectorFunctions).forEach(propKey => {
        newProps[propKey] = propTransforms.selectorFunctions[propKey](state)
      })

      Object.keys(selectors).forEach(selectorKey => {
        newProps[selectorKey] = selectors[selectorKey](state)
      })

      console.log({ newProps })

      return Object.assign({}, props, newProps, { actions })
    }

    return connectAdvanced(selectorFactory, { methodName: 'inline' })(Klass)
  }
}
