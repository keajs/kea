/* global test, expect, beforeEach */
import { kea, getStore, resetContext } from '../index'
import './helper/jsdom'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { mount, configure } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

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
  resetContext()
})

test('getStore can be initalized with a preloaded state for non-kea reducers', () => {
  const preloadedState = {
    'kea': {},
    'scenes': { 'something': { 'name': 'chirpy' } },
    'routes': { 'someRoute': true }
  }
  const store = getStore({
    reducers: {
      routes: (state = {}, action) => state
    },
    preloadedState: preloadedState
  })
  expect(store.getState()).toEqual({
    kea: {},
    scenes: {},
    routes: { 'someRoute': true }
  })
})

test('getStore preloaded state will be immidiatly overiden by reducer default state', () => {
  // use defaults instead of initalizing kea reducers

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
  expect(wrapper.find('.name').text()).toEqual('chirpy')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy')

  expect(store.getState()).toEqual({
    'kea': {},
    'scenes': { 'something': { 'name': 'chirpy' } }
  })

  wrapper.unmount()
})
