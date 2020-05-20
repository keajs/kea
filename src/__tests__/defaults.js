/* global test, expect, beforeEach */
import { kea, resetContext, getContext } from '../index'

import './helper/jsdom'
import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetContext()
})

test('defaults from props for lazy', () => {
  function SampleComponent({ id, propsName, connectedName, directName, capitalizedName }) {
    return (
      <div>
        <div className="id">{id}</div>
        <div className="propsName">{propsName}</div>
        <div className="capitalizedName">{capitalizedName}</div>
      </div>
    )
  }

  const { store } = getContext()

  const singletonLogic = kea({
    path: () => ['scenes', 'dynamic'],

    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions, constants, props, selectors }) => ({
      propsName: [
        props.defaultName,
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),

    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.propsName],
        name => {
          return name
            .trim()
            .split(' ')
            .map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`)
            .join(' ')
        },
        PropTypes.string,
      ],
    }),
  })

  const ConnectedComponent = singletonLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id="12" defaultName="defaultName" />
    </Provider>,
  )

  expect(wrapper.find('.propsName').text()).toEqual('defaultName')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Defaultname')

  expect(store.getState()).toEqual({
    kea: {},
    scenes: { dynamic: { propsName: 'defaultName' } },
  })

  singletonLogic.actions.updateName('birb')

  expect(store.getState()).toEqual({
    kea: {},
    scenes: { dynamic: { propsName: 'birb' } },
  })

  wrapper.render()

  expect(wrapper.find('.propsName').text()).toEqual('birb')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Birb')

  wrapper.unmount()
})

test('defaults from selectors', () => {
  function SampleComponent({ id, connectedName, directName, capitalizedName }) {
    return (
      <div>
        <div className="id">{id}</div>
        <div className="connectedName">{connectedName}</div>
        <div className="directName">{directName}</div>
        <div className="capitalizedName">{capitalizedName}</div>
      </div>
    )
  }

  const { store } = getContext()

  const randomStore = kea({
    actions: ({ constants }) => ({
      updateStoredName: storedName => ({ storedName }),
    }),

    reducers: ({ actions }) => ({
      storedName: [
        'storedName',
        PropTypes.string,
        {
          [actions.updateStoredName]: (_, payload) => payload.storedName,
        },
      ],
    }),
  })

  const singletonLogic = kea({
    connect: {
      values: [randomStore, ['storedName']],
      actions: [randomStore, ['updateStoredName']],
    },

    path: () => ['scenes', 'dynamic'],

    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),

    reducers: ({ actions, constants, props, selectors }) => ({
      connectedName: [
        selectors.storedName,
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
      // randomStore.selectors is not yet built, so we must delay calling it
      // with another selector or mount it before building this logic
      directName: [
        state => randomStore.selectors.storedName(state),
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),

    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.connectedName],
        name => {
          return name
            .trim()
            .split(' ')
            .map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`)
            .join(' ')
        },
        PropTypes.string,
      ],
    }),
  })

  const ConnectedComponent = singletonLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id="12" defaultName="defaultName" />
    </Provider>,
  )

  expect(wrapper.find('.capitalizedName').text()).toEqual('Storedname')
  expect(wrapper.find('.connectedName').text()).toEqual('storedName')
  expect(wrapper.find('.directName').text()).toEqual('storedName')

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'storedName' } } },
    scenes: { dynamic: { connectedName: 'storedName', directName: 'storedName' } },
  })

  store.dispatch(singletonLogic.actionCreators.updateStoredName('birb'))

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'birb' } } },
    scenes: { dynamic: { connectedName: 'storedName', directName: 'storedName' } },
  })

  singletonLogic.actions.updateName('birb')

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'birb' } } },
    scenes: { dynamic: { connectedName: 'birb', directName: 'birb' } },
  })

  wrapper.render()

  expect(wrapper.find('.capitalizedName').text()).toEqual('Birb')
  expect(wrapper.find('.connectedName').text()).toEqual('birb')
  expect(wrapper.find('.directName').text()).toEqual('birb')

  wrapper.unmount()
})

test('defaults from input.defaults selector', () => {
  function SampleComponent({ id, connectedName, directName, capitalizedName }) {
    return (
      <div>
        <div className="id">{id}</div>
        <div className="connectedName">{connectedName}</div>
        <div className="directName">{directName}</div>
        <div className="capitalizedName">{capitalizedName}</div>
      </div>
    )
  }

  const { store } = getContext()

  const randomStore = kea({
    actions: ({ constants }) => ({
      updateStoredName: storedName => ({ storedName }),
    }),

    reducers: ({ actions }) => ({
      storedName: [
        'storedName',
        PropTypes.string,
        {
          [actions.updateStoredName]: (_, payload) => payload.storedName,
        },
      ],
    }),
  })

  randomStore.mount()

  const dynamicLogic = kea({
    connect: {
      values: [randomStore, ['storedName']],
      actions: [randomStore, ['updateStoredName']],
    },

    key: props => props.id,
    path: key => ['scenes', 'dynamic', key],

    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),

    defaults: ({ selectors }) => (state, props) => ({
      // using the selector syntax for the entire object
      connectedName: selectors.storedName(state), // gets a value
      directName: randomStore.selectors.storedName, // gets passed as a selector
    }),

    reducers: ({ actions }) => ({
      connectedName: [
        '',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
      directName: [
        '',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),

    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.connectedName],
        name => {
          return name
            .trim()
            .split(' ')
            .map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`)
            .join(' ')
        },
        PropTypes.string,
      ],
    }),
  })

  const ConnectedComponent = dynamicLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id="12" defaultName="defaultName" />
    </Provider>,
  )

  expect(wrapper.find('.capitalizedName').text()).toEqual('Storedname')
  expect(wrapper.find('.connectedName').text()).toEqual('storedName')
  expect(wrapper.find('.directName').text()).toEqual('storedName')

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'storedName' } } },
    scenes: { dynamic: { 12: { connectedName: 'storedName', directName: 'storedName' } } },
  })

  dynamicLogic({ id: 12 }).actions.updateStoredName('birb')

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'birb' } } },
    scenes: { dynamic: { 12: { connectedName: 'storedName', directName: 'storedName' } } },
  })

  store.dispatch(dynamicLogic({ id: 12 }).actionCreators.updateName('birb'))

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { storedName: 'birb' } } },
    scenes: { dynamic: { 12: { connectedName: 'birb', directName: 'birb' } } },
  })

  wrapper.render()

  expect(wrapper.find('.capitalizedName').text()).toEqual('Birb')
  expect(wrapper.find('.connectedName').text()).toEqual('birb')
  expect(wrapper.find('.directName').text()).toEqual('birb')

  wrapper.unmount()
})

test('defaults from props via input.defaults without selector', () => {
  function SampleComponent({ id, propsName, capitalizedName }) {
    return (
      <div>
        <div className="id">{id}</div>
        <div className="propsName">{propsName}</div>
        <div className="capitalizedName">{capitalizedName}</div>
      </div>
    )
  }

  const { store } = getContext()

  const lazyLogic = kea({
    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),

    defaults: ({ selectors, props }) => ({
      propsName: props.defaultName,
    }),

    reducers: ({ actions }) => ({
      propsName: [
        '',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),

    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.propsName],
        name => {
          return name
            .trim()
            .split(' ')
            .map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`)
            .join(' ')
        },
        PropTypes.string,
      ],
    }),
  })

  const ConnectedComponent = lazyLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id="12" defaultName="defaultName" />
    </Provider>,
  )

  expect(wrapper.find('.propsName').text()).toEqual('defaultName')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Defaultname')

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { propsName: 'defaultName' } } },
  })

  lazyLogic.actions.updateName('birb')

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { propsName: 'birb' } } },
  })

  wrapper.render()

  expect(wrapper.find('.propsName').text()).toEqual('birb')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Birb')

  wrapper.unmount()
})

test('defaults from selectors in input.defaults without selector', () => {
  function SampleComponent({ id, connectedName, directName, capitalizedName }) {
    return (
      <div>
        <div className="id">{id}</div>
        <div className="connectedName">{connectedName}</div>
        <div className="directName">{directName}</div>
        <div className="capitalizedName">{capitalizedName}</div>
      </div>
    )
  }

  const { store } = getContext()

  const randomStore = kea({
    actions: ({ constants }) => ({
      updateStoredName: storedName => ({ storedName }),
    }),

    reducers: ({ actions }) => ({
      storedName: [
        'storedName',
        PropTypes.string,
        {
          [actions.updateStoredName]: (_, payload) => payload.storedName,
        },
      ],
    }),
  })

  const singletonLogic = kea({
    connect: {
      values: [randomStore, ['storedName']],
      actions: [randomStore, ['updateStoredName']],
    },

    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),

    defaults: ({ selectors, props }) => ({
      // using the selector syntax for the entire object
      connectedName: selectors.storedName, // gets a value
      directName: 'george', // gets passed as a selector
    }),

    reducers: ({ actions }) => ({
      connectedName: [
        '',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
      directName: [
        '',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),

    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.connectedName],
        name => {
          return name
            .trim()
            .split(' ')
            .map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`)
            .join(' ')
        },
        PropTypes.string,
      ],
    }),
  })

  const ConnectedComponent = singletonLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id="12" defaultName="defaultName" />
    </Provider>,
  )

  expect(wrapper.find('.capitalizedName').text()).toEqual('Storedname')
  expect(wrapper.find('.connectedName').text()).toEqual('storedName')
  expect(wrapper.find('.directName').text()).toEqual('george')

  expect(store.getState()).toEqual({
    kea: { inline: { 2: { storedName: 'storedName' }, 1: { connectedName: 'storedName', directName: 'george' } } },
  })

  singletonLogic.actions.updateStoredName('birb')

  expect(store.getState()).toEqual({
    kea: { inline: { 2: { storedName: 'birb' }, 1: { connectedName: 'storedName', directName: 'george' } } },
  })

  store.dispatch(singletonLogic.actionCreators.updateName('birb'))

  expect(store.getState()).toEqual({
    kea: { inline: { 2: { storedName: 'birb' }, 1: { connectedName: 'birb', directName: 'birb' } } },
  })

  wrapper.render()

  expect(wrapper.find('.capitalizedName').text()).toEqual('Birb')
  expect(wrapper.find('.connectedName').text()).toEqual('birb')
  expect(wrapper.find('.directName').text()).toEqual('birb')

  wrapper.unmount()
})

test('defaults from input.defaults as object', () => {
  function SampleComponent({ id, propsName, connectedName, directName, capitalizedName }) {
    return (
      <div>
        <div className="id">{id}</div>
        <div className="propsName">{propsName}</div>
        <div className="connectedName">{connectedName}</div>
        <div className="directName">{directName}</div>
        <div className="capitalizedName">{capitalizedName}</div>
      </div>
    )
  }

  const { store } = getContext()

  const singletonLogic = kea({
    actions: () => ({
      updateName: name => ({ name }),
    }),

    defaults: {
      propsName: 'defaultName',
      connectedName: 'storedName',
      directName: 'george',
    },

    reducers: ({ actions }) => ({
      propsName: [
        '',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
      connectedName: [
        '',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
      directName: [
        '',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),

    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.propsName],
        name => {
          return name
            .trim()
            .split(' ')
            .map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`)
            .join(' ')
        },
        PropTypes.string,
      ],
    }),
  })

  const ConnectedComponent = singletonLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent />
    </Provider>,
  )

  expect(wrapper.find('.propsName').text()).toEqual('defaultName')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Defaultname')
  expect(wrapper.find('.connectedName').text()).toEqual('storedName')
  expect(wrapper.find('.directName').text()).toEqual('george')

  expect(store.getState()).toEqual({
    kea: { inline: { 1: { propsName: 'defaultName', connectedName: 'storedName', directName: 'george' } } },
  })

  wrapper.unmount()
})

test('defaults from selector that returns an object', () => {
  function SampleComponent({ id, propsName, connectedName, directName, capitalizedName }) {
    return (
      <div>
        <div className="id">{id}</div>
        <div className="propsName">{propsName}</div>
        <div className="connectedName">{connectedName}</div>
        <div className="directName">{directName}</div>
        <div className="capitalizedName">{capitalizedName}</div>
      </div>
    )
  }

  const { store } = getContext()

  const randomStore = kea({
    actions: () => ({
      updateObject: object => ({ object }),
    }),

    reducers: ({ actions }) => ({
      object: [
        { propsName: 'henry', connectedName: 'george', directName: 'joe' },
        PropTypes.object,
        {
          [actions.updateObject]: (state, payload) => ({ ...state, ...payload.object }),
        },
      ],
    }),
  })

  const singletonLogic = kea({
    connect: {
      values: [randomStore, ['object']],
      actions: [randomStore, ['updateObject']],
    },

    actions: () => ({
      updateName: name => ({ name }),
    }),

    defaults: ({ selectors }) => selectors.object,

    reducers: ({ actions }) => ({
      propsName: [
        '',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
      connectedName: [
        '',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
      directName: [
        '',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),

    selectors: ({ constants, selectors }) => ({
      capitalizedName: [
        () => [selectors.propsName],
        name => {
          return name
            .trim()
            .split(' ')
            .map(k => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`)
            .join(' ')
        },
        PropTypes.string,
      ],
    }),
  })

  const ConnectedComponent = singletonLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent />
    </Provider>,
  )

  expect(wrapper.find('.propsName').text()).toEqual('henry')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Henry')
  expect(wrapper.find('.connectedName').text()).toEqual('george')
  expect(wrapper.find('.directName').text()).toEqual('joe')

  expect(store.getState()).toEqual({
    kea: {
      inline: {
        1: { propsName: 'henry', connectedName: 'george', directName: 'joe' },
        2: { object: { propsName: 'henry', connectedName: 'george', directName: 'joe' } },
      },
    },
  })

  wrapper.unmount()
})
