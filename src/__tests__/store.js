/* global test, expect, beforeEach */
import { kea, getStore, resetKeaCache } from '../index'
import './helper/jsdom'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'

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

beforeEach(() => {
  resetKeaCache()
})

test('getStore can be initalized with a preloaded state', () => {
  const preloadedState = {
    'kea': {},
    'scenes': { 'something': { 'name': 'chirpy' } }
  }
  const store = getStore({
    preloadedState
  })
  expect(store.getState()).toEqual(preloadedState)
})


test('getStore preloaded state will not be immidiatly overiden by reducer defautl state', () => {
  const preloadedState = {
    'kea': {},
    'scenes': { 'something': { 'name': 'chirpoo' } }
  }
  const store = getStore({
    preloadedState
  })

  const singletonLogic = kea({
    path: () => ['scenes', 'something'],
    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, constants }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
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

  const ConnectedComponent = singletonLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  )

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpoo')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpoo')

  expect(store.getState()).toEqual(preloadedState)

  wrapper.unmount()
})
