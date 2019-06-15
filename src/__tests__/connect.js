/* global test, expect, beforeEach */
import { kea, getContext, resetContext } from '../index'

import './helper/jsdom'
import React from 'react'
import PropTypes from 'prop-types'
import { mount, configure } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetContext({ createStore: true })
})

test('connect works as an object', () => {
  const { store } = getContext()
  const connectedLogic = kea({
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

  const SampleComponent = ({ id, name, capitalizedName, description, actions: { updateName } }) => (
    <div>
      <div className='id'>{id}</div>
      <div className='name'>{name}</div>
      <div className='capitalizedName'>{capitalizedName}</div>
      <div className='description'>{description}</div>
      <div className='updateName' onClick={updateName}>updateName</div>
    </div>
  )

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

test('connect works as a function', () => {
  const { store } = getContext()
  const connectedLogic = kea({
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
    connect: () => ({
      props: [connectedLogic, ['description']]
    }),

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

  const SampleComponent = ({ id, name, capitalizedName, description, actions: { updateName } }) => (
    <div>
      <div className='id'>{id}</div>
      <div className='name'>{name}</div>
      <div className='capitalizedName'>{capitalizedName}</div>
      <div className='description'>{description}</div>
      <div className='updateName' onClick={updateName}>updateName</div>
    </div>
  )

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
  
test('props cascade when connecting', () => {
  const { store } = getContext()
  
  const connectedLogic = kea({
    actions: () => ({
      updateDescription: description => ({ description })
    }),

    reducers: ({ actions, props }) => ({
      description: [props.defaultDescription || '', PropTypes.string, {
        [actions.updateDescription]: (_, payload) => payload.description
      }]
    })
  })

  const logic = kea({
    connect: {
      props: [connectedLogic, ['description']]
    },

    actions: () => ({
      updateName: name => ({ name })
    }),

    reducers: ({ actions, props }) => ({
      name: [`chirpy-${props.id}`, PropTypes.string, {
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

  const SampleComponent = ({ id, name, capitalizedName, description, actions: { updateName } }) => (
    <div>
      <div className='id'>{id}</div>
      <div className='name'>{name}</div>
      <div className='capitalizedName'>{capitalizedName}</div>
      <div className='description'>{description}</div>
      <div className='updateName' onClick={updateName}>updateName</div>
    </div>
  )

  const ConnectedComponent = logic(SampleComponent)

  expect(store.getState()).toEqual({ kea: {}, scenes: {} })

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} defaultDescription='this is a bird' />
    </Provider>
  )

  expect(store.getState()).toEqual({ kea: { inline: { 1: { name: 'chirpy-12' }, 2: { description: 'this is a bird' } } }, scenes: {} })

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy-12')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy-12')
  expect(wrapper.find('.description').text()).toEqual('this is a bird')

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
  