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

// test('can use withkey for actions and props', () => {
//   const store = getStore()

//   const dynamicLogic = kea({
//     key: (props) => props.id,
//     path: (key) => ['scenes', 'dynamic', key],

//     actions: () => ({
//       updateName: name => ({ name })
//     }),

//     reducers: ({ actions, props, key }) => ({
//       // TODO: support with props.something here
//       name: [props.id, PropTypes.string, {
//         [actions.updateName]: (state, payload) => payload.name
//       }]
//     })
//   })

//   const connectedLogic = kea({
//     connect: {
//       props: [
//         dynamicLogic.connectKey(props => props.id), ['name']
//       ],
//       actions: [
//         dynamicLogic.connectKey(props => props.id), ['updateName']
//       ]
//     }
//   })

//   const SampleComponent = ({ id, name }) => (
//     <div>
//       <div className='id'>{id}</div>
//       <div className='name'>{name}</div>
//     </div>
//   )

//   const ConnectedComponent = connectedLogic(SampleComponent)

//   const wrapper = mount(
//     <Provider store={store}>
//       <ConnectedComponent id='12' />
//     </Provider>
//   )

//   expect(wrapper.find('.id').text()).toEqual('12')
//   expect(wrapper.find('.name').text()).toEqual('bird')

//   expect(store.getState()).toEqual({ kea: {}, scenes: { dynamic: { 12: { name: 'bird' } } } })

//   store.dispatch(dynamicLogic.withKey(12).actions.updateName('birb'))

//   expect(store.getState()).toEqual({ kea: {}, scenes: { dynamic: { 12: { name: 'birb' } } } })

//   wrapper.render()

//   expect(wrapper.find('.id').text()).toEqual('12')
//   expect(wrapper.find('.name').text()).toEqual('birb')

//   wrapper.unmount()
// })
