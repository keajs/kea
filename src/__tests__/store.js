/* global test, expect, beforeEach */
import { kea, getStore, resetContext, getContext } from '../index'
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
  resetContext({ createStore: false })
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

test('can use createStore on resetContext', () => {
  const context = resetContext({
    createStore: true
  })

  expect(context).toBe(getContext())
  expect(context.store).toBeDefined()
  expect(Object.keys(context.store.getState()).sort()).toEqual(['kea'])

  const secondContext = resetContext({
    createStore: {
      paths: ['kea', 'scenes', 'parrots']
    }
  })

  expect(secondContext).toBe(getContext())
  expect(secondContext.store).toBeDefined()
  expect(Object.keys(secondContext.store.getState()).sort()).toEqual(['kea', 'parrots', 'scenes'])
})

test('can create reducers with random paths', () => {
  const context = resetContext({
    createStore: {
      reducers: {
        router: () => 'router'
      }
    }
  })

  expect(Object.keys(context.store.getState()).sort()).toEqual(['kea', 'router'])

  const existingLogic = kea({
    path: () => ['parrots', 'nz', 'kea'],
    reducers: () => ({
      sheep: ['tasty']
    })
  })

  const nonExistingLogic = kea({
    path: () => ['birds', 'nz', 'kea'],
    reducers: () => ({
      sheep: ['tasty']
    })
  })

  existingLogic.mount()
  expect(context.store.getState().parrots.nz.kea.sheep).toBe('tasty')

  nonExistingLogic.mount()
  expect(context.store.getState().birds.nz.kea.sheep).toBe('tasty')

  expect(Object.keys(context.store.getState()).sort()).toEqual( ['birds', 'kea', 'parrots', 'router'])
})

test('can not create reducers with random paths if restricted', () => {
  const context = resetContext({
    createStore: {
      paths: ['kea', 'scenes', 'parrots'],
      reducers: {
        router: () => 'router'
      }
    }
  })

  expect(Object.keys(context.store.getState()).sort()).toEqual(['kea', 'parrots', 'router', 'scenes'])

  const existingLogic = kea({
    path: () => ['parrots', 'nz', 'kea'],
    reducers: () => ({
      sheep: ['tasty']
    })
  })

  const nonExistingLogic = kea({
    path: () => ['birds', 'nz', 'kea'],
    reducers: () => ({
      sheep: ['tasty']
    })
  })

  existingLogic.mount()

  expect(context.store.getState().parrots.nz.kea.sheep).toBe('tasty')

  expect(() => {
    nonExistingLogic.mount()
  }).toThrow(`[KEA] Can not start reducer's path with "birds"! Please add it to the whitelist`)
})
