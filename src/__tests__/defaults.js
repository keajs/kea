/* global test, expect, beforeEach */
import { kea, getStore, resetKeaCache } from '../index'

import './helper/jsdom'
import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetKeaCache()
})

test('defaults from props and selectors', () => {
  function SampleComponent ({ id, propsName, connectedName, directName, capitalizedName }) {
    return (
      <div>
        <div className='id'>{id}</div>
        <div className='propsName'>{propsName}</div>
        <div className='connectedName'>{connectedName}</div>
        <div className='directName'>{directName}</div>
        <div className='capitalizedName'>{capitalizedName}</div>
      </div>
    )
  }

  const store = getStore()

  const randomStore = kea({
    actions: ({ constants }) => ({
      updateStoredName: storedName => ({ storedName })
    }),

    reducers: ({ actions }) => ({
      storedName: ['storedName', PropTypes.string, {
        [actions.updateStoredName]: (_, payload) => payload.storedName
      }]
    })
  })

  const singletonLogic = kea({
    // TODO: it must also work without requiring lazy here!
    options: { lazy: true },
    connect: {
      props: [randomStore, ['storedName']],
      actions: [randomStore, ['updateStoredName']]
    },

    // TODO: it must also work without requiring a key here!
    key: (props) => props.id,
    path: (key) => ['scenes', 'dynamic', key],

    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),

    reducers: ({ actions, constants, props, selectors }) => ({
      propsName: [props.defaultName, PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }],
      connectedName: [selectors.storedName, PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }],
      directName: [randomStore.selectors.storedName, PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),

    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.propsName],
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
      <ConnectedComponent id='12' defaultName='defaultName' />
    </Provider>
  )

  expect(wrapper.find('.propsName').text()).toEqual('defaultName')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Defaultname')
  expect(wrapper.find('.connectedName').text()).toEqual('storedName')
  expect(wrapper.find('.directName').text()).toEqual('storedName')

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'storedName' } } },
    scenes: { dynamic: { 12: { propsName: 'defaultName', connectedName: 'storedName', directName: 'storedName' } } }
  })

  store.dispatch(singletonLogic.actions.updateStoredName('birb'))

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'birb' } } },
    scenes: { dynamic: { 12: { propsName: 'defaultName', connectedName: 'storedName', directName: 'storedName' } } }
  })

  store.dispatch(singletonLogic.actions.updateName('birb'))

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'birb' } } },
    scenes: { dynamic: { 12: { propsName: 'birb', connectedName: 'birb', directName: 'birb' } } }
  })

  wrapper.render()

  expect(wrapper.find('.propsName').text()).toEqual('birb')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Birb')
  expect(wrapper.find('.connectedName').text()).toEqual('birb')
  expect(wrapper.find('.directName').text()).toEqual('birb')

  wrapper.unmount()
})

test('defaults from input.defaults selector', () => {
  function SampleComponent ({ id, propsName, connectedName, directName, capitalizedName }) {
    return (
      <div>
        <div className='id'>{id}</div>
        <div className='propsName'>{propsName}</div>
        <div className='connectedName'>{connectedName}</div>
        <div className='directName'>{directName}</div>
        <div className='capitalizedName'>{capitalizedName}</div>
      </div>
    )
  }

  const store = getStore()

  const randomStore = kea({
    actions: ({ constants }) => ({
      updateStoredName: storedName => ({ storedName })
    }),

    reducers: ({ actions }) => ({
      storedName: ['storedName', PropTypes.string, {
        [actions.updateStoredName]: (_, payload) => payload.storedName
      }]
    })
  })

  const singletonLogic = kea({
    // TODO: it must also work without requiring lazy here!
    options: { lazy: true },
    connect: {
      props: [randomStore, ['storedName']],
      actions: [randomStore, ['updateStoredName']]
    },

    // TODO: it must also work without requiring a key here!
    key: (props) => props.id,
    path: (key) => ['scenes', 'dynamic', key],

    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),

    defaults: ({ selectors }) => (state, props) => ({ // using the selector syntax for the entire object
      propsName: props.defaultName,
      connectedName: selectors.storedName(state), // gets a value
      directName: randomStore.selectors.storedName // gets passed as a selector
    }),

    reducers: ({ actions }) => ({
      propsName: ['', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }],
      connectedName: ['', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }],
      directName: ['', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),

    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.propsName],
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
      <ConnectedComponent id='12' defaultName='defaultName' />
    </Provider>
  )

  expect(wrapper.find('.propsName').text()).toEqual('defaultName')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Defaultname')
  expect(wrapper.find('.connectedName').text()).toEqual('storedName')
  expect(wrapper.find('.directName').text()).toEqual('storedName')

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'storedName' } } },
    scenes: { dynamic: { 12: { propsName: 'defaultName', connectedName: 'storedName', directName: 'storedName' } } }
  })

  store.dispatch(singletonLogic.actions.updateStoredName('birb'))

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'birb' } } },
    scenes: { dynamic: { 12: { propsName: 'defaultName', connectedName: 'storedName', directName: 'storedName' } } }
  })

  store.dispatch(singletonLogic.actions.updateName('birb'))

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'birb' } } },
    scenes: { dynamic: { 12: { propsName: 'birb', connectedName: 'birb', directName: 'birb' } } }
  })

  wrapper.render()

  expect(wrapper.find('.propsName').text()).toEqual('birb')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Birb')
  expect(wrapper.find('.connectedName').text()).toEqual('birb')
  expect(wrapper.find('.directName').text()).toEqual('birb')

  wrapper.unmount()
})

test('defaults from input.defaults without selector', () => {
  function SampleComponent ({ id, propsName, connectedName, directName, capitalizedName }) {
    return (
      <div>
        <div className='id'>{id}</div>
        <div className='propsName'>{propsName}</div>
        <div className='connectedName'>{connectedName}</div>
        <div className='directName'>{directName}</div>
        <div className='capitalizedName'>{capitalizedName}</div>
      </div>
    )
  }

  const store = getStore()

  const randomStore = kea({
    actions: ({ constants }) => ({
      updateStoredName: storedName => ({ storedName })
    }),

    reducers: ({ actions }) => ({
      storedName: ['storedName', PropTypes.string, {
        [actions.updateStoredName]: (_, payload) => payload.storedName
      }]
    })
  })

  const singletonLogic = kea({
    // TODO: it must also work without requiring lazy here!
    options: { lazy: true },
    connect: {
      props: [randomStore, ['storedName']],
      actions: [randomStore, ['updateStoredName']]
    },

    // TODO: it must also work without requiring a key here!
    key: (props) => props.id,
    path: (key) => ['scenes', 'dynamic', key],

    actions: ({ constants }) => ({
      updateName: name => ({ name })
    }),

    defaults: ({ selectors, props }) => ({ // using the selector syntax for the entire object
      propsName: props.defaultName,
      connectedName: selectors.storedName, // gets a value
      directName: 'george' // gets passed as a selector
    }),

    reducers: ({ actions }) => ({
      propsName: ['', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }],
      connectedName: ['', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }],
      directName: ['', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),

    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.propsName],
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
      <ConnectedComponent id='12' defaultName='defaultName' />
    </Provider>
  )

  expect(wrapper.find('.propsName').text()).toEqual('defaultName')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Defaultname')
  expect(wrapper.find('.connectedName').text()).toEqual('storedName')
  expect(wrapper.find('.directName').text()).toEqual('george')

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'storedName' } } },
    scenes: { dynamic: { 12: { propsName: 'defaultName', connectedName: 'storedName', directName: 'george' } } }
  })

  store.dispatch(singletonLogic.actions.updateStoredName('birb'))

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'birb' } } },
    scenes: { dynamic: { 12: { propsName: 'defaultName', connectedName: 'storedName', directName: 'george' } } }
  })

  store.dispatch(singletonLogic.actions.updateName('birb'))

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'birb' } } },
    scenes: { dynamic: { 12: { propsName: 'birb', connectedName: 'birb', directName: 'birb' } } }
  })

  wrapper.render()

  expect(wrapper.find('.propsName').text()).toEqual('birb')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Birb')
  expect(wrapper.find('.connectedName').text()).toEqual('birb')
  expect(wrapper.find('.directName').text()).toEqual('birb')

  wrapper.unmount()
})

test('defaults from input.defaults as object', () => {
  function SampleComponent ({ id, propsName, connectedName, directName, capitalizedName }) {
    return (
      <div>
        <div className='id'>{id}</div>
        <div className='propsName'>{propsName}</div>
        <div className='connectedName'>{connectedName}</div>
        <div className='directName'>{directName}</div>
        <div className='capitalizedName'>{capitalizedName}</div>
      </div>
    )
  }

  const store = getStore()

  const singletonLogic = kea({
    actions: () => ({
      updateName: name => ({ name })
    }),

    defaults: { // using the selector syntax for the entire object
      propsName: 'defaultName',
      connectedName: 'storedName', // gets a value
      directName: 'george' // gets passed as a selector
    },

    reducers: ({ actions }) => ({
      propsName: ['', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }],
      connectedName: ['', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }],
      directName: ['', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),

    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.propsName],
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
      <ConnectedComponent />
    </Provider>
  )

  expect(wrapper.find('.propsName').text()).toEqual('defaultName')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Defaultname')
  expect(wrapper.find('.connectedName').text()).toEqual('storedName')
  expect(wrapper.find('.directName').text()).toEqual('george')

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { propsName: 'defaultName', connectedName: 'storedName', directName: 'george' } } },
    scenes: {}
  })

  wrapper.unmount()
})
