/* global test, expect, beforeEach */
import { kea, getStore, resetKeaCache } from '../index'

import './helper/jsdom'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'

class PersonComponent extends Component {
  render() {
    const { id, name, capitalizedName } = this.props
    const { updateName } = this.actions

    return (
      <div>
        <div className="id">{id}</div>
        <div className="name">{name}</div>
        <div className="updateName" onClick={updateName}>
          updateName
        </div>
      </div>
    )
  }
}

class DogComponent extends Component {
  render() {
    return (
      <div>
        <div className="owner">{this.props.owner}</div>
        <div className="name">{this.props.name}</div>
      </div>
    )
  }
}

beforeEach(() => {
  resetKeaCache()
})

test('two instances of a dynamic component', () => {
  const store = getStore()

  const personLogic = kea({
    key: props => props.id,
    path: key => ['scenes', 'people', key],
    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),
    reducers: ({ actions, key, props, constants }) => ({
      name: [
        'chirpy',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => {
            return payload.key === key ? payload.name + payload.key : state
          },
        },
      ],
    }),
  })

  const ConnectedComponent = personLogic(PersonComponent)

  const wrapper = mount(
    <Provider store={store}>
      <div>
        <ConnectedComponent id={8} />
        <ConnectedComponent id={12} />
      </div>
    </Provider>
  )

  expect(
    wrapper
      .find(PersonComponent)
      .findWhere(n => n.prop('id') === 8)
      .find('.name')
      .text()
  ).toEqual('chirpy')
  expect(
    wrapper
      .find(PersonComponent)
      .findWhere(n => n.prop('id') === 12)
      .find('.name')
      .text()
  ).toEqual('chirpy')
  expect(store.getState()).toEqual({
    kea: {},
    scenes: { people: { 8: { name: 'chirpy' }, 12: { name: 'chirpy' } } },
  })

  const personComponent8 = wrapper.find('PersonComponent').findWhere(n => n.prop('id') === 8).node
  const { updateName } = personComponent8.actions
  updateName('somename')

  expect(
    wrapper
      .find(PersonComponent)
      .findWhere(n => n.prop('id') === 8)
      .find('.name')
      .text()
  ).toEqual('somename8')
  expect(
    wrapper
      .find(PersonComponent)
      .findWhere(n => n.prop('id') === 12)
      .find('.name')
      .text()
  ).toEqual('chirpy')
  expect(store.getState()).toEqual({
    kea: {},
    scenes: { people: { 8: { name: 'somename8' }, 12: { name: 'chirpy' } } },
  })

  wrapper.unmount()
})

test('dynamic connected component using props', () => {
  const store = getStore()

  const personLogic = kea({
    key: props => props.id,
    path: key => ['scenes', 'people', key],
    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),
    reducers: ({ actions, key, props, constants }) => ({
      name: [
        'chirpy',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => {
            return payload.key === key ? payload.name + payload.key : state
          },
        },
      ],
    }),
  })
  const ConnectedComponent = personLogic(PersonComponent)

  const dogLogic = kea({
    connect: {
      props: [personLogic.withKey(props => props.id), ['name as owner']],
    },
    key: props => props.id,
    path: key => ['scenes', 'dogs', key],
    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),
    reducers: ({ actions, key, props, constants }) => ({
      name: [
        'wufus',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => {
            return payload.key === key ? payload.name + payload.key : state
          },
        },
      ],
    }),
  })
  const ConnectedDogComponent = dogLogic(DogComponent)

  const wrapper = mount(
    <Provider store={store}>
      <div>
        <ConnectedComponent id={8} />
        <ConnectedComponent id={12} />
        <ConnectedDogComponent id={8} />
        <ConnectedDogComponent id={12} />
      </div>
    </Provider>
  )

  // console.log(wrapper.debug())

  expect(
    wrapper
      .find(DogComponent)
      .findWhere(n => n.prop('id') === 8)
      .find('.owner')
      .text()
  ).toEqual('chirpy')
  expect(
    wrapper
      .find(DogComponent)
      .findWhere(n => n.prop('id') === 12)
      .find('.owner')
      .text()
  ).toEqual('chirpy')
  expect(store.getState()).toEqual({
    kea: {},
    scenes: {
      people: { 8: { name: 'chirpy' }, 12: { name: 'chirpy' } },
      dogs: { 8: { name: 'wufus' }, 12: { name: 'wufus' } },
    },
  })

  const personComponent8 = wrapper.find('PersonComponent').findWhere(n => n.prop('id') === 8).node
  personComponent8.actions.updateName('somename')
  const dogComponent12 = wrapper.find('DogComponent').findWhere(n => n.prop('id') === 12).node
  dogComponent12.actions.updateName('goofy')

  expect(
    wrapper
      .find(DogComponent)
      .findWhere(n => n.prop('id') === 8)
      .find('.owner')
      .text()
  ).toEqual('somename8')
  expect(
    wrapper
      .find(DogComponent)
      .findWhere(n => n.prop('id') === 12)
      .find('.owner')
      .text()
  ).toEqual('chirpy')
  expect(
    wrapper
      .find(DogComponent)
      .findWhere(n => n.prop('id') === 12)
      .find('.name')
      .text()
  ).toEqual('goofy12')
  expect(store.getState()).toEqual({
    kea: {},
    scenes: {
      people: { 8: { name: 'somename8' }, 12: { name: 'chirpy' } },
      dogs: { 8: { name: 'wufus' }, 12: { name: 'goofy12' } },
    },
  })

  wrapper.unmount()
})

test('dynamic connected component using actions', () => {
  const store = getStore()

  const personLogic = kea({
    key: props => props.id,
    path: key => ['scenes', 'people', key],
    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),
    reducers: ({ actions, key, props, constants }) => ({
      name: [
        'chirpy',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => {
            return payload.key === key ? payload.name + payload.key : state
          },
        },
      ],
    }),
  })
  const ConnectedComponent = personLogic(PersonComponent)

  const dogLogic = kea({
    connect: {
      props: [personLogic.withKey(props => props.id), ['name as owner']],
      actions: [personLogic.withKey(props => props.id), ['updateName as updateOwner']],
    },
    key: props => props.id,
    path: key => ['scenes', 'dogs', key],
    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),
    reducers: ({ actions, key, props, constants }) => ({
      name: [
        'wufus',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => {
            return payload.key === key ? payload.name + payload.key : state
          },
        },
      ],
    }),
  })
  const ConnectedDogComponent = dogLogic(DogComponent)

  const wrapper = mount(
    <Provider store={store}>
      <div>
        <ConnectedComponent id={8} />
        <ConnectedComponent id={12} />
        <ConnectedDogComponent id={8} />
        <ConnectedDogComponent id={12} />
      </div>
    </Provider>
  )

  // console.log(wrapper.debug())

  expect(
    wrapper
      .find(DogComponent)
      .findWhere(n => n.prop('id') === 8)
      .find('.owner')
      .text()
  ).toEqual('chirpy')
  expect(store.getState()).toEqual({
    kea: {},
    scenes: {
      people: { 8: { name: 'chirpy' }, 12: { name: 'chirpy' } },
      dogs: { 8: { name: 'wufus' }, 12: { name: 'wufus' } },
    },
  })

  const dogComponent8 = wrapper.find('DogComponent').findWhere(n => n.prop('id') === 8).node
  dogComponent8.actions.updateOwner('frank')

  expect(
    wrapper
      .find(PersonComponent)
      .findWhere(n => n.prop('id') === 8)
      .find('.name')
      .text()
  ).toEqual('frank8')
  expect(
    wrapper
      .find(DogComponent)
      .findWhere(n => n.prop('id') === 8)
      .find('.owner')
      .text()
  ).toEqual('frank8')
  expect(store.getState()).toEqual({
    kea: {},
    scenes: {
      people: { 8: { name: 'frank8' }, 12: { name: 'chirpy' } },
      dogs: { 8: { name: 'wufus' }, 12: { name: 'wufus' } },
    },
  })

  wrapper.unmount()
})

test('dynamic connected component configuring reducer with connected action', () => {
  const store = getStore()

  const personLogic = kea({
    key: props => props.id,
    path: key => ['scenes', 'people', key],
    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),
    reducers: ({ actions, key, props, constants }) => ({
      name: [
        'chirpy',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => {
            return payload.key === key ? payload.name + payload.key : state
          },
        },
      ],
    }),
  })
  const ConnectedComponent = personLogic(PersonComponent)

  const dogLogic = kea({
    connect: {
      props: [personLogic.withKey(props => props.id), ['name as owner']],
      actions: [personLogic.withKey(props => props.id), ['updateName as updateOwner']],
    },
    key: props => props.id,
    path: key => ['scenes', 'dogs', key],
    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),
    reducers: ({ actions, key, props, constants }) => ({
      name: [
        'wufus',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => {
            return payload.key === key ? payload.name + payload.key : state
          },
        },
      ],
      ownerChanged: [
        false,
        PropTypes.boolean,
        {
          [actions.updateOwner]: (state, payload) => {
            return payload.key === key ? true : state
          },
        },
      ],
    }),
  })
  const ConnectedDogComponent = dogLogic(DogComponent)

  const wrapper = mount(
    <Provider store={store}>
      <div>
        <ConnectedComponent id={8} />
        <ConnectedComponent id={12} />
        <ConnectedDogComponent id={8} />
        <ConnectedDogComponent id={12} />
      </div>
    </Provider>
  )

  expect(store.getState()).toEqual({
    kea: {},
    scenes: {
      people: { 8: { name: 'chirpy' }, 12: { name: 'chirpy' } },
      dogs: {
        8: { name: 'wufus', ownerChanged: false },
        12: { name: 'wufus', ownerChanged: false },
      },
    },
  })

  const dogComponent8 = wrapper.find('DogComponent').findWhere(n => n.prop('id') === 8).node
  dogComponent8.actions.updateOwner('frank')

  expect(store.getState()).toEqual({
    kea: {},
    scenes: {
      people: { 8: { name: 'frank8' }, 12: { name: 'chirpy' } },
      dogs: {
        8: { name: 'wufus', ownerChanged: true },
        12: { name: 'wufus', ownerChanged: false },
      },
    },
  })

  const personComponent12 = wrapper.find('PersonComponent').findWhere(n => n.prop('id') === 12).node
  personComponent12.actions.updateName('bart')

  expect(store.getState()).toEqual({
    kea: {},
    scenes: {
      people: { 8: { name: 'frank8' }, 12: { name: 'bart12' } },
      dogs: { 8: { name: 'wufus', ownerChanged: true }, 12: { name: 'wufus', ownerChanged: true } },
    },
  })

  wrapper.unmount()
})

test('dynamic connected component updates external store', () => {
  const store = getStore({
    paths: ['kea', 'scenes', 'dogOwners'],
    preloadedState: { dogOwners: [] },
  })

  const personLogic = kea({
    key: props => props.id,
    path: key => ['scenes', 'people', key],
    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),
    reducers: ({ actions, key, props, constants }) => ({
      name: [
        'chirpy',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => {
            return payload.key === key ? payload.name + payload.key : state
          },
        },
      ],
    }),
  })
  const ConnectedComponent = personLogic(PersonComponent)

  const dogLogic = kea({
    connect: {
      props: [
        personLogic.withKey(props => props.id),
        ['name as owner'],
        store => store,
        ['dogOwners'],
      ],
      actions: [personLogic.withKey(props => props.id), ['updateName as updateOwner']],
    },
    key: props => props.id,
    path: key => ['scenes', 'dogs', key],
    actions: ({ constants }) => ({
      updateName: name => ({ name }),
    }),
    reducers: ({ actions, key, props, constants }) => ({
      name: [
        'wufus',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => {
            return payload.key === key ? payload.name + payload.key : state
          },
        },
      ],
      ownerChanged: [
        false,
        PropTypes.boolean,
        {
          [actions.updateOwner]: (state, payload) => {
            return payload.key === key ? true : state
          },
        },
      ],
      dogOwners: [
        [],
        PropTypes.array,
        {
          [actions.updateOwner]: (state, payload) => {
            return payload.key === key ? [...state, payload.name] : state
          },
        },
      ],
    }),
  })
  const ConnectedDogComponent = dogLogic(DogComponent)

  const wrapper = mount(
    <Provider store={store}>
      <div>
        <ConnectedComponent id={8} />
        <ConnectedComponent id={12} />
        <ConnectedDogComponent id={8} />
        <ConnectedDogComponent id={12} />
      </div>
    </Provider>
  )

  expect(store.getState()).toEqual({
    kea: {},
    scenes: {
      people: { 8: { name: 'chirpy' }, 12: { name: 'chirpy' } },
      dogs: {
        8: { name: 'wufus', ownerChanged: false },
        12: { name: 'wufus', ownerChanged: false },
      },
    },
    dogOwners: [],
  })

  const dogComponent8 = wrapper.find('DogComponent').findWhere(n => n.prop('id') === 8).node
  dogComponent8.actions.updateOwner('frank')

  expect(store.getState()).toEqual({
    kea: {},
    scenes: {
      people: { 8: { name: 'frank8' }, 12: { name: 'chirpy' } },
      dogs: {
        8: { name: 'wufus', ownerChanged: true },
        12: { name: 'wufus', ownerChanged: false },
      },
    },
    dogOwners: ['frank'],
  })

  const personComponent12 = wrapper.find('PersonComponent').findWhere(n => n.prop('id') === 12).node
  personComponent12.actions.updateName('bart')

  expect(store.getState()).toEqual({
    kea: {},
    scenes: {
      people: { 8: { name: 'frank8' }, 12: { name: 'bart12' } },
      dogs: { 8: { name: 'wufus', ownerChanged: true }, 12: { name: 'wufus', ownerChanged: true } },
    },
    dogOwners: ['frank', 'bart'],
  })

  wrapper.unmount()
})
