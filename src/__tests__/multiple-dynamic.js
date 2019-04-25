/* global test, expect, beforeEach */
import { kea, getStore, resetKeaCache } from '../index'

import './helper/jsdom'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { mount, configure } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetKeaCache()
})

test('multiple dynamic logic stores', () => {
  const store = getStore()

  const dynamicLogic = kea({
    key: (props) => props.id,
    path: (key) => ['scenes', 'dynamic', key],
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, props, key }) => ({
      name: ['', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    })
  })

  const SampleComponent = ({ id, name }) => (
    <div>
      <div className='id'>{id}</div>
      <div className='name'>{name}</div>
    </div>
  )

  const ConnectedComponent = dynamicLogic(SampleComponent)

  const allNames = [{ id: 12, name: 'bla' }, { id: 13, name: 'george' }, { id: 15, name: 'michael' }]

  const wrapper = mount(
    <Provider store={store}>
      {allNames.map(location => (
        <ConnectedComponent key={location.id} id={location.id} />
      ))}
    </Provider>
  )

  // expect(wrapper.find('.id').text()).toEqual('12')
  // expect(wrapper.find('.name').text()).toEqual('bird')

  // expect(store.getState()).toEqual({ kea: {}, scenes: { dynamic: { 12: { name: 'bird' } } } })

  // store.dispatch(dynamicLogic.withKey(12).actions.updateName('birb'))

  // expect(store.getState()).toEqual({ kea: {}, scenes: { dynamic: { 12: { name: 'birb' } } } })

  // wrapper.render()

  // expect(wrapper.find('.id').text()).toEqual('12')
  // expect(wrapper.find('.name').text()).toEqual('birb')

  wrapper.unmount()
})
