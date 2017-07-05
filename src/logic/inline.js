import { createPropTransforms, propTypesFromMapping } from './props'
import { createActions, createActionTransforms } from './actions'
import { combineReducerObjects, convertReducerArrays } from './reducer'
import { convertConstants } from './create'
import { pathSelector, createSelectors } from './selectors'
import { addReducer } from '../scene/store'
import shallowEqual from '../utils/shallow-equal'
import { createSelector } from 'reselect'

import { connectAdvanced } from 'react-redux'

let inlineCache = {}

export function cachedSelectors (path) {
  return inlineCache[path.join('.')] || {}
}

export function inline (_this) {
  return function (Klass) {
    // createLogic(_this, )
    let object = {}

    // pregenerate as many things as we can
    object.path = _this.path('').filter(p => p)
    object.constants = _this.constants ? convertConstants(_this.constants(object)) : {}
    object.actions = _this.actions ? createActions(_this.actions(object), object.path) : {}

    // the { connect: { props, actions } } part
    const mapping = _this.connect || {}

    // get default proptypes and add connected ones
    let propTypes = Object.assign({}, mapping.props ? propTypesFromMapping(mapping) : {}, Klass.propTypes || {})

    // add proptypes from reducer
    const reducers = _this.reducers ? convertReducerArrays(_this.reducers(object)) : {}
    Object.keys(reducers).forEach(reducerKey => {
      if (reducers[reducerKey].type) {
        propTypes[reducerKey] = reducers[reducerKey].type
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
      find: (key) => cachedSelectors(_this.path(key))
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

    const selectorFactory = (dispatch, options) => {
      let lastProps = {}
      let result = null

      return (nextState, nextOwnProps) => {
        const key = _this.key ? _this.key(nextOwnProps) : 'index'

        if (typeof key === 'undefined') {
          console.error(`"key" can't be undefined in path: ${_this.path('undefined').join('.')}`)
        }

        const path = _this.path(key)
        const joinedPath = path.join('.')

        console.log(`Inline selectorFactory for ${joinedPath}`)
        console.log({ nextOwnProps, nextState, key, path })

        let selector
        let selectors

        // now we must check if the reducer is already in redux, or we need to add it
        // if we need to add it, create "dummy" selectors for the default values until then

        // is the reducer created? if we have "true" in the cache, it's definitely created
        let reducerCreated = inlineCache[joinedPath] && inlineCache[joinedPath].reducerCreated

        // if it's not let's double check. maybe it is now?
        if (!reducerCreated) {
          try {
            selector = (state) => pathSelector(path, state)
            reducerCreated = typeof selector(nextState) !== 'undefined'
          } catch (e) {
            reducerCreated = false
          }
        }

        // we have the selectors cached! with the current reducerCreated state!
        if (inlineCache[joinedPath] && inlineCache[joinedPath].reducerCreated === reducerCreated) {
          console.log('cache hit!')
          selector = inlineCache[joinedPath].selector
          selectors = inlineCache[joinedPath].selectors

        // either we have nothing cached or the cache is invalid. regenerate the selectors!
        } else {
          if (!selector) {
            selector = (state) => pathSelector(path, state)
          }

          // add { path } and { key } to the reducer creator function
          let localObject = Object.assign({}, object, { path, key })
          localObject.reducers = _this.reducers ? convertReducerArrays(_this.reducers(localObject)) : {}
          localObject.reducer = _this.reducer ? _this.reducer(localObject) : combineReducerObjects(path, localObject.reducers)

          // if the reducer is in redux, get real reducer selectors. otherwise add dummies that return defaults
          if (reducerCreated) {
            selectors = createSelectors(path, Object.keys(localObject.reducers))
          } else {
            addReducer(path, localObject.reducer, true)
            selectors = {}
            Object.keys(localObject.reducers).forEach(key => {
              selectors[key] = () => localObject.reducers[key].value
            })
          }

          // create
          const selectorResponse = _this.selectors ? _this.selectors(Object.assign({}, localObject, { selectors })) : {}

          Object.keys(selectorResponse).forEach(selectorKey => {
            // s == [() => args, selectorFunction, propType]
            const s = selectorResponse[selectorKey]

            const args = s[0]()
            selectors[selectorKey] = createSelector(...args, s[1])
          })

          // store in the cache
          inlineCache[joinedPath] = {
            reducerCreated,
            selector,
            selectors
          }
        }

        console.log({ selector, selectors })

        let actions = {}

        // pass conneted actions as they are
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

        let nextProps = Object.assign({}, nextOwnProps)

        // connected props
        Object.keys(connectedSelectors).forEach(propKey => {
          nextProps[propKey] = connectedSelectors[propKey](nextState)
        })

        Object.keys(selectors).forEach(selectorKey => {
          nextProps[selectorKey] = selectors[selectorKey](nextState)
        })

        console.log({ nextProps })

        // if the props did not change, return the old cached object
        if (!result || !shallowEqual(lastProps, nextProps)) {
          lastProps = nextProps
          result = Object.assign({}, nextProps, { actions })
        }

        return result
      }
    }

    return connectAdvanced(selectorFactory, { methodName: 'inline' })(Klass)
  }
}
