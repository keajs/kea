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

    // pregenerate as many things as we can
    object.path = _this.path('').filter(p => p)
    object.constants = _this.constants ? convertConstants(_this.constants(object)) : {}
    object.actions = _this.actions ? createActions(_this.actions(object), object.path) : {}
    object.reducers = _this.reducers ? convertReducerArrays(_this.reducers(object)) : {}
    object.reducer = _this.reducer ? _this.reducer(object) : combineReducerObjects(false, object.reducers)

    // the { connect: { props, actions } } part
    const mapping = _this.connect || {}

    // get default proptypes and add connected ones
    let propTypes = Object.assign({}, mapping.props ? propTypesFromMapping(mapping) : {}, Klass.propTypes || {})

    // add proptypes from reducer
    Object.keys(object.reducers).forEach(reducerKey => {
      if (object.reducers[reducerKey].type) {
        propTypes[reducerKey] = object.reducers[reducerKey].type
      }
    })

    // add proptypes from selectors
    const selectorsThatDontWork = _this.selectors ? _this.selectors({}) : {}
    Object.keys(selectorsThatDontWork).forEach(selectorKey => {
      if (selectorsThatDontWork[selectorKey][2]) {
        propTypes[selectorKey] = selectorsThatDontWork[selectorKey][2]
      }
    })

    // add kea metadata to component
    Klass.kea = {
      path: _this.path,
      constants: object.constants,
      actions: object.actions,
      reducers: object.reducers,
      reducer: object.reducer
    }

    // convert this.props.actions to this.actions in the component
    const originalComponentWillMount = Klass.prototype.componentWillMount
    Klass.prototype.componentWillMount = function () {
      this.actions = this.props.actions
      originalComponentWillMount && originalComponentWillMount.bind(this)()
    }

    // connected actions and props/selectors
    const connectedActions = createActionTransforms(mapping.actions).actions
    const connectedSelectors = createPropTransforms(mapping.props).selectorFunctions

    // TODO: cache props like here:
    // https://github.com/reactjs/react-redux/blob/master/docs/api.md#inject-todos-of-a-specific-user-depending-on-props-and-inject-propsuserid-into-the-action-1

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
            selectors[key] = () => object.reducers[key].value
          })
        }

        const selectorResponse = _this.selectors ? _this.selectors(Object.assign({}, object, { selectors, key })) : {}

        Object.keys(selectorResponse).forEach(selectorKey => {
          // s == [() => args, selectorFunction, propType]
          const s = selectorResponse[selectorKey]

          const args = s[0]()
          selectors[selectorKey] = createSelector(...args, s[1])
        })

        if (reducerCreated) {
          inlineCache[joinedPath] = {
            selector,
            selectors
          }
        }
      }

      console.log({ selector, selectors })

      let actions = {}

      // pass conneted actions as is
      Object.keys(connectedActions).forEach(actionKey => {
        actions[actionKey] = (...args) => dispatch(connectedActions[actionKey](...args))
      })

      // inject key to the payload of inline actions
      Object.keys(object.actions).forEach(actionKey => {
        actions[actionKey] = (...args) => {
          const createdAction = object.actions[actionKey](...args)
          return dispatch({
            ...createdAction,
            payload: {
              key,
              ...createdAction.payload
            }
          })
        }
      })

      console.log({ actions })

      let newProps = {}

      // connected props
      Object.keys(connectedSelectors).forEach(propKey => {
        newProps[propKey] = connectedSelectors[propKey](state)
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
