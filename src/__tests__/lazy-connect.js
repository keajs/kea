/* global test, expect, beforeEach */
import { kea, getStore, resetContext } from '../index'

import './helper/jsdom'
import React from 'react'
import PropTypes from 'prop-types'
import { mount, configure } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetContext()
})

test('connected lazy logic loading builds it', () => {
  const store = getStore()

  const connectedLogic = kea({
    options: { lazy: true },

    actions: () => ({
      updateDescription: description => ({ description })
    }),

    reducers: ({ actions }) => ({
      description: ['default', PropTypes.string, {
        [actions.updateDescription]: (_, payload) => payload.description
      }]
    })
  })

  const logic = kea({
    options: { lazy: true },

    connect: {
      props: [connectedLogic, ['description']]
    },

    actions: () => ({
      updateName: name => ({ name })
    }),

    reducers: ({ actions }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),

    selectors: ({ selectors }) => ({
      capitalizedName: [
        () => [selectors.name],
        (name) => {
          return name.trim().split(' ').map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`).join(' ')
        },
        PropTypes.string
      ]
    })
  })

  // nothing yet in the store
  expect(store.getState()).toEqual({ kea: {}, scenes: {} })

  const SampleComponent = ({ id, name, capitalizedName, description, actions: { updateName } }) => (
    <div>
      <div className='id'>{id}</div>
      <div className='name'>{name}</div>
      <div className='capitalizedName'>{capitalizedName}</div>
      <div className='description'>{description}</div>
      <div className='updateName' onClick={updateName}>updateName</div>
    </div>
  )

  expect(store.getState()).toEqual({ kea: {}, scenes: {} })

  const ConnectedComponent = logic(SampleComponent)

  expect(store.getState()).toEqual({ kea: {}, scenes: {} })

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  )

  expect(store.getState()).toEqual({ kea: { inline: { 1: { name: 'chirpy' }, 2: { description: 'default' } } }, scenes: {} })

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy')
  expect(wrapper.find('.description').text()).toEqual('default')

  expect(store.getState()).toEqual({ kea: { inline: { 1: { name: 'chirpy' }, 2: { description: 'default' } } }, scenes: {} })

  store.dispatch(logic.actions.updateName('somename'))
  store.dispatch(connectedLogic.actions.updateDescription('new description'))

  expect(store.getState()).toEqual({ kea: { inline: { 1: { name: 'somename' }, 2: { description: 'new description' } } }, scenes: {} })

  wrapper.render()

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename')
  expect(wrapper.find('.description').text()).toEqual('new description')

  wrapper.unmount()

  // nothing in the store after unmounting
  expect(store.getState()).toEqual({ kea: {}, scenes: {} })
})
