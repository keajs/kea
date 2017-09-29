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

test('singletons connect to react components', () => {
  const store = getStore()

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

  expect(store.getState()).toEqual({ kea: {}, scenes: { something: { name: 'chirpy' } } })

  const sampleComponent = wrapper.find('SampleComponent').node

  expect(sampleComponent.actions).toBeDefined()
  expect(Object.keys(sampleComponent.actions)).toEqual(['updateName'])

  const { updateName } = sampleComponent.actions
  updateName('somename')

  expect(store.getState()).toEqual({ kea: {}, scenes: { something: { name: 'somename' } } })

  wrapper.render()

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename')

  wrapper.unmount()
})

test('dynamic connect to react components', () => {
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
    </Provider>
  )

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy')

  expect(store.getState()).toEqual({ kea: {}, scenes: { something: { 12: { name: 'chirpy' } } } })

  const sampleComponent = wrapper.find('SampleComponent').node

  expect(sampleComponent.actions).toBeDefined()
  expect(Object.keys(sampleComponent.actions)).toEqual(['updateName'])

  const { updateName } = sampleComponent.actions
  updateName('somename')

  expect(store.getState()).toEqual({ kea: {}, scenes: { something: { 12: { name: 'somename12' } } } })

  wrapper.render()

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename12')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename12')

  wrapper.unmount()
})

test('connected props can be used as selectors', () => {
  const store = getStore()

  const firstLogic = kea({
    path: () => ['scenes', 'homepage', 'first'],
    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, constants }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    })
  })

  const secondLogic = kea({
    path: () => ['scenes', 'homepage', 'second'],
    connect: {
      props: [
        firstLogic, [
          'name'
        ]
      ],
      actions: [
        firstLogic, [
          'updateName'
        ]
      ]
    },
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

  const ConnectedComponent = secondLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  )

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy')

  expect(store.getState()).toEqual({kea: {}, scenes: {homepage: {first: {name: 'chirpy'}, second: {}}}})

  const sampleComponent = wrapper.find('SampleComponent').node

  expect(sampleComponent.actions).toBeDefined()
  expect(Object.keys(sampleComponent.actions)).toEqual(['updateName'])

  const { updateName } = sampleComponent.actions
  updateName('somename')

  expect(store.getState()).toEqual({kea: {}, scenes: {homepage: {first: {name: 'somename'}, second: {}}}})

  wrapper.render()

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename')

  wrapper.unmount()
})
