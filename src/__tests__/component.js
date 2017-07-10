/* global test, expect */
import { kea } from '../logic/kea'
import { clearActionCache } from '../logic/actions'
import { keaSaga, keaReducer, clearStore } from '../scene/store'

import './helper/jsdom'
import React, { Component, PropTypes } from 'react'
import { mount } from 'enzyme'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'

class SampleComponent extends Component {
  render () {
    const { id, name, capitalizedName } = this.props
    const { updateName } = this.actions

    return (
      <div>
        <div className='id'>{id}</div>
        <div className='name'>{name}</div>
        <div className='capitalizedName'>{capitalizedName}</div>
        <div className='updateName' onClick={updateName}>updateName</div>
      </div>
    )
  }
}

function getStore () {
  clearActionCache()
  clearStore()

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)

  const store = finalCreateStore(reducers)

  sagaMiddleware.run(keaSaga)

  return store
}

test('connects to react components', () => {
  const store = getStore()

  const dynamicLogic = kea({
    key: (props) => props.id,
    path: (key) => ['scenes', 'something', key],
    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, constants }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name + payload.key
      }]
    }),
    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.name],
        (name) => {
          return name.trim().split(' ').map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`).join(' ')
        },
        PropTypes.string
      ]
    })
  })

  const ConnectedComponent = dynamicLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>,
  )

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy')

  // This doesn't work yet. The store is only regenerated when an action is sent
  // expect(store.getState()).toEqual({ scenes: { something: { 12: { name: 'chirpy' } } } })

  const sampleComponent = wrapper.find('SampleComponent').node

  expect(sampleComponent.actions).toBeDefined()
  expect(Object.keys(sampleComponent.actions)).toEqual(['updateName'])

  const { updateName } = sampleComponent.actions
  updateName('somename')

  expect(store.getState()).toEqual({ scenes: { something: { 12: { name: 'somename12' } } } })

  wrapper.render()

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename12')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename12')
})
