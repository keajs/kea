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
    const { id, name, capitalizedName, upperCaseName } = this.props
    const { updateName } = this.actions

    return (
      <div>
        <div className='id'>{id}</div>
        <div className='name'>{name}</div>
        <div className='capitalizedName'>{capitalizedName}</div>
        <div className='upperCaseName'>{upperCaseName}</div>
        <div className='updateName' onClick={updateName}>updateName</div>
      </div>
    )
  }
}

class ActionComponent extends Component {
  render () {
    return (
      <div>
        <div className='actions'>{Object.keys(this.actions).sort().join(',')}</div>
        <div className='props'>{Object.keys(this.props).sort().join(',')}</div>
        <div className='name'>{this.props.name}</div>
      </div>
    )
  }
}

beforeEach(() => {
  resetContext()
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

  const ConnectedComponent = singletonLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  )

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy')
  expect(wrapper.find('.upperCaseName').text()).toEqual('CHIRPY')

  expect(store.getState()).toEqual({ kea: {}, scenes: { something: { name: 'chirpy' } } })

  const sampleComponent = wrapper.find('SampleComponent').instance()

  expect(sampleComponent.actions).toBeDefined()
  expect(Object.keys(sampleComponent.actions)).toEqual(['updateName'])

  const { updateName } = sampleComponent.actions
  updateName('somename')

  expect(store.getState()).toEqual({ kea: {}, scenes: { something: { name: 'somename' } } })

  wrapper.render()

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename')
  expect(wrapper.find('.upperCaseName').text()).toEqual('SOMENAME')

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
    reducers: ({ actions, constants, key }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name + key
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

  const ConnectedComponent = dynamicLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  )

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy')
  expect(wrapper.find('.upperCaseName').text()).toEqual('CHIRPY')

  expect(store.getState()).toEqual({ kea: {}, scenes: { something: { 12: { name: 'chirpy' } } } })

  const sampleComponent = wrapper.find('SampleComponent').instance()

  expect(sampleComponent.actions).toBeDefined()
  expect(Object.keys(sampleComponent.actions)).toEqual(['updateName'])

  const { updateName } = sampleComponent.actions
  updateName('somename')

  expect(store.getState()).toEqual({ kea: {}, scenes: { something: { 12: { name: 'somename12' } } } })

  wrapper.render()

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename12')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename12')
  expect(wrapper.find('.upperCaseName').text()).toEqual('SOMENAME12')

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

  const ConnectedComponent = secondLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  )

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy')
  expect(wrapper.find('.upperCaseName').text()).toEqual('CHIRPY')

  expect(store.getState()).toEqual({kea: {}, scenes: {homepage: {first: {name: 'chirpy'}}}})

  const sampleComponent = wrapper.find('SampleComponent').instance()

  expect(sampleComponent.actions).toBeDefined()
  expect(Object.keys(sampleComponent.actions)).toEqual(['updateName'])

  const { updateName } = sampleComponent.actions
  updateName('somename')

  expect(store.getState()).toEqual({kea: {}, scenes: {homepage: {first: {name: 'somename'}}}})

  wrapper.render()

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename')
  expect(wrapper.find('.upperCaseName').text()).toEqual('SOMENAME')

  wrapper.unmount()
})

test('doubly connected actions are merged', () => {
  const store = getStore()

  const firstLogic = kea({
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
    actions: ({ constants }) => ({
      updateNameAgain: name => ({ name })
    })
  })

  const ConnectedComponent = firstLogic(secondLogic(ActionComponent))

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent />
    </Provider>
  )

  expect(wrapper.find('.props').text()).toEqual('actions,dispatch,name')
  expect(wrapper.find('.actions').text()).toEqual('updateName,updateNameAgain')

  wrapper.unmount()
})

test('no protypes needed', () => {
  const store = getStore()

  const firstLogic = kea({
    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, constants }) => ({
      name: ['chirpy', {
        [actions.updateName]: (state, payload) => payload.name
      }]
    })
  })

  const secondLogic = kea({
    actions: ({ constants }) => ({
      updateNameAgain: name => ({ name })
    })
  })

  const ConnectedComponent = firstLogic(secondLogic(ActionComponent))

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent />
    </Provider>
  )

  expect(wrapper.find('.props').text()).toEqual('actions,dispatch,name')
  expect(wrapper.find('.actions').text()).toEqual('updateName,updateNameAgain')
  const sampleComponent = wrapper.find('ActionComponent').instance()

  const { updateName } = sampleComponent.actions
  updateName('somename')

  expect(wrapper.find('.name').text()).toEqual('somename')

  wrapper.unmount()
})

test('can select with regular', () => {
  const store = getStore({
    reducers: {
      random: () => ({ some: 'value' })
    }
  })

  const logic = kea({
    path: () => ['scenes', 'kea', 'first'],

    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),

    reducers: ({ actions, constants }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    })
  })

  const connectedLogic = kea({
    connect: {
      props: [
        logic, ['name'],
        (state) => state.random, ['some']
      ]
    }
  })

  function RegularSelectorTest ({ name, some }) {
    return (
      <div className='values'>
        {name},{some}
      </div>
    )
  }

  const ConnectedComponent = connectedLogic(RegularSelectorTest)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent />
    </Provider>
  )

  expect(wrapper.find('.values').text()).toEqual('chirpy,value')

  wrapper.unmount()
})

test('dynamic reducer initial props', () => {
  const store = getStore()

  const dynamicLogic = kea({
    key: (props) => props.id,
    path: (key) => ['scenes', 'dynamic', key],
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, props, key }) => ({
      name: [props.defaultName, PropTypes.string, {
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

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} defaultName='bird' />
    </Provider>
  )

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('bird')

  expect(store.getState()).toEqual({ kea: {}, scenes: { dynamic: { 12: { name: 'bird' } } } })

  store.dispatch(dynamicLogic.build({ id: 12 }).actions.updateName('birb'))

  expect(store.getState()).toEqual({ kea: {}, scenes: { dynamic: { 12: { name: 'birb' } } } })

  wrapper.render()

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('birb')

  wrapper.unmount()
})
