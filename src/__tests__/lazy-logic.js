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
  // resetContext()
})

test('eager logic loading works', () => {
  resetContext({ autoMount: true })

  const store = getStore()

  const logic = kea({
    path: () => ['scenes', 'eager'],
    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, constants }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),
    selectors: ({ constants, selectors }) => ({
      upperCaseName: [
        () => [selectors.capitalizedName],
        (capitalizedName) => {
          return capitalizedName.toUpperCase()
        },
        PropTypes.string
      ],
      capitalizedName: [
        () => [selectors.name],
        (name) => {
          return name.trim().split(' ').map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`).join(' ')
        },
        PropTypes.string
      ]
    })
  })

  // chirpy is already in the store
  expect(store.getState()).toEqual({ kea: {}, scenes: { eager: { name: 'chirpy' } } })

  const SampleComponent = ({ id, name, capitalizedName, upperCaseName, actions: { updateName } }) => (
    <div>
      <div className='id'>{id}</div>
      <div className='name'>{name}</div>
      <div className='capitalizedName'>{capitalizedName}</div>
      <div className='upperCaseName'>{upperCaseName}</div>
      <div className='updateName' onClick={updateName}>updateName</div>
    </div>
  )

  const ConnectedComponent = logic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  )

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy')
  expect(wrapper.find('.upperCaseName').text()).toEqual('CHIRPY')

  expect(store.getState()).toEqual({ kea: {}, scenes: { eager: { name: 'chirpy' } } })

  store.dispatch(logic.actions.updateName('somename'))

  expect(store.getState()).toEqual({ kea: {}, scenes: { eager: { name: 'somename' } } })

  wrapper.render()

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename')
  expect(wrapper.find('.upperCaseName').text()).toEqual('SOMENAME')

  wrapper.unmount()

  // logic remains in the store
  expect(store.getState()).toEqual({ kea: {}, scenes: { eager: { name: 'somename' } } })
})

test('lazy logic loading works', () => {
  resetContext({ autoMount: false })

  const store = getStore()

  const logic = kea({
    path: () => ['scenes', 'lazy'],
    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, constants }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),
    selectors: ({ constants, selectors }) => ({
      upperCaseName: [
        () => [selectors.capitalizedName],
        (capitalizedName) => {
          return capitalizedName.toUpperCase()
        },
        PropTypes.string
      ],
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

  const SampleComponent = ({ id, name, capitalizedName, upperCaseName, actions: { updateName } }) => (
    <div>
      <div className='id'>{id}</div>
      <div className='name'>{name}</div>
      <div className='capitalizedName'>{capitalizedName}</div>
      <div className='upperCaseName'>{upperCaseName}</div>
      <div className='updateName' onClick={updateName}>updateName</div>
    </div>
  )

  const ConnectedComponent = logic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  )

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy')
  expect(wrapper.find('.upperCaseName').text()).toEqual('CHIRPY')

  expect(store.getState()).toEqual({ kea: {}, scenes: { lazy: { name: 'chirpy' } } })

  store.dispatch(logic.actions.updateName('somename'))

  expect(store.getState()).toEqual({ kea: {}, scenes: { lazy: { name: 'somename' } } })

  wrapper.render()

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename')
  expect(wrapper.find('.upperCaseName').text()).toEqual('SOMENAME')

  wrapper.unmount()

  // nothing in the store after unmounting
  expect(store.getState()).toEqual({ kea: {}, scenes: {} })
})
