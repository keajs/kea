/* global test, expect, beforeEach */
import { kea, getContext, resetContext } from '../../src'

import './helper/jsdom'
import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { render, screen } from '@testing-library/react'

beforeEach(() => {
  resetContext({ createStore: true })
})

test('connect works as an object', () => {
  const { store } = getContext()
  const connectedLogic = kea({
    actions: () => ({
      updateDescription: (description) => ({ description }),
    }),

    reducers: ({ actions }) => ({
      description: [
        'default',
        PropTypes.string,
        {
          [actions.updateDescription]: (_, payload) => payload.description,
        },
      ],
    }),
  })

  const logic = kea({
    connect: {
      values: [connectedLogic, ['description']],
    },

    actions: () => ({
      updateName: (name) => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'chirpy',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),

    selectors: ({ selectors }) => ({
      capitalizedName: [
        () => [selectors.name],
        (name) => {
          return name
            .trim()
            .split(' ')
            .map((k) => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`)
            .join(' ')
        },
        PropTypes.string,
      ],
    }),
  })

  const SampleComponent = ({ id, name, capitalizedName, description, actions: { updateName } }) => (
    <div>
      <div data-testid="id">{id}</div>
      <div data-testid="name">{name}</div>
      <div data-testid="capitalizedName">{capitalizedName}</div>
      <div data-testid="description">{description}</div>
      <div data-testid="updateName" onClick={updateName}>
        updateName
      </div>
    </div>
  )

  const ConnectedComponent = logic(SampleComponent)

  expect(store.getState()).toEqual({ kea: {} })

  render(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>,
  )

  expect(store.getState()).toEqual({ kea: { logic: { 1: { name: 'chirpy' }, 2: { description: 'default' } } } })

  expect(screen.getByTestId('id')).toHaveTextContent('12')
  expect(screen.getByTestId('name')).toHaveTextContent('chirpy')
  expect(screen.getByTestId('capitalizedName')).toHaveTextContent('Chirpy')
  expect(screen.getByTestId('description')).toHaveTextContent('default')

  expect(store.getState()).toEqual({ kea: { logic: { 1: { name: 'chirpy' }, 2: { description: 'default' } } } })

  logic.actions.updateName('somename')
  connectedLogic.actions.updateDescription('new description')

  expect(store.getState()).toEqual({
    kea: { logic: { 1: { name: 'somename' }, 2: { description: 'new description' } } },
  })

  expect(screen.getByTestId('id')).toHaveTextContent('12')
  expect(screen.getByTestId('name')).toHaveTextContent('somename')
  expect(screen.getByTestId('capitalizedName')).toHaveTextContent('Somename')
  expect(screen.getByTestId('description')).toHaveTextContent('new description')
})

test('connect works as a function', () => {
  const { store } = getContext()
  const connectedLogic = kea({
    actions: () => ({
      updateDescription: (description) => ({ description }),
    }),

    reducers: ({ actions }) => ({
      description: [
        'default',
        PropTypes.string,
        {
          [actions.updateDescription]: (_, payload) => payload.description,
        },
      ],
    }),
  })

  const logic = kea({
    connect: () => ({
      values: [connectedLogic, ['description']],
    }),

    actions: () => ({
      updateName: (name) => ({ name }),
    }),

    reducers: ({ actions }) => ({
      name: [
        'chirpy',
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),

    selectors: ({ selectors }) => ({
      capitalizedName: [
        () => [selectors.name],
        (name) => {
          return name
            .trim()
            .split(' ')
            .map((k) => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`)
            .join(' ')
        },
        PropTypes.string,
      ],
    }),
  })

  const SampleComponent = ({ id, name, capitalizedName, description, actions: { updateName } }) => (
    <div>
      <div data-testid="id">{id}</div>
      <div data-testid="name">{name}</div>
      <div data-testid="capitalizedName">{capitalizedName}</div>
      <div data-testid="description">{description}</div>
      <div data-testid="updateName" onClick={updateName}>
        updateName
      </div>
    </div>
  )

  const ConnectedComponent = logic(SampleComponent)

  expect(store.getState()).toEqual({ kea: {} })

  render(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>,
  )

  expect(store.getState()).toEqual({ kea: { logic: { 1: { name: 'chirpy' }, 2: { description: 'default' } } } })

  expect(screen.getByTestId('id')).toHaveTextContent('12')
  expect(screen.getByTestId('name')).toHaveTextContent('chirpy')
  expect(screen.getByTestId('capitalizedName')).toHaveTextContent('Chirpy')
  expect(screen.getByTestId('description')).toHaveTextContent('default')

  expect(store.getState()).toEqual({ kea: { logic: { 1: { name: 'chirpy' }, 2: { description: 'default' } } } })

  store.dispatch(logic.actionCreators.updateName('somename'))
  store.dispatch(connectedLogic.actionCreators.updateDescription('new description'))

  expect(store.getState()).toEqual({
    kea: { logic: { 1: { name: 'somename' }, 2: { description: 'new description' } } },
  })

  expect(screen.getByTestId('id')).toHaveTextContent('12')
  expect(screen.getByTestId('name')).toHaveTextContent('somename')
  expect(screen.getByTestId('capitalizedName')).toHaveTextContent('Somename')
  expect(screen.getByTestId('description')).toHaveTextContent('new description')
})

test('props cascade when connecting', () => {
  const { store } = getContext()

  const connectedLogic = kea({
    actions: () => ({
      updateDescription: (description) => ({ description }),
    }),

    reducers: ({ actions, props }) => ({
      description: [
        props.defaultDescription || '',
        PropTypes.string,
        {
          [actions.updateDescription]: (_, payload) => payload.description,
        },
      ],
    }),
  })

  const logic = kea({
    connect: {
      values: [connectedLogic, ['description']],
    },

    actions: () => ({
      updateName: (name) => ({ name }),
    }),

    reducers: ({ actions, props }) => ({
      name: [
        `chirpy-${props.id}`,
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),

    selectors: ({ selectors }) => ({
      capitalizedName: [
        () => [selectors.name],
        (name) => {
          return name
            .trim()
            .split(' ')
            .map((k) => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`)
            .join(' ')
        },
        PropTypes.string,
      ],
    }),
  })

  const SampleComponent = ({ id, name, capitalizedName, description, actions: { updateName } }) => (
    <div>
      <div data-testid="id">{id}</div>
      <div data-testid="name">{name}</div>
      <div data-testid="capitalizedName">{capitalizedName}</div>
      <div data-testid="description">{description}</div>
      <div data-testid="updateName" onClick={updateName}>
        updateName
      </div>
    </div>
  )

  const ConnectedComponent = logic(SampleComponent)

  expect(store.getState()).toEqual({ kea: {} })

  render(
    <Provider store={store}>
      <ConnectedComponent id={12} defaultDescription="this is a bird" />
    </Provider>,
  )

  expect(store.getState()).toEqual({
    kea: { logic: { 1: { name: 'chirpy-12' }, 2: { description: 'this is a bird' } } },
  })

  expect(screen.getByTestId('id')).toHaveTextContent('12')
  expect(screen.getByTestId('name')).toHaveTextContent('chirpy-12')
  expect(screen.getByTestId('capitalizedName')).toHaveTextContent('Chirpy-12')
  expect(screen.getByTestId('description')).toHaveTextContent('this is a bird')

  logic.actions.updateName('somename')
  connectedLogic.actions.updateDescription('new description')

  expect(store.getState()).toEqual({
    kea: { logic: { 1: { name: 'somename' }, 2: { description: 'new description' } } },
  })

  expect(screen.getByTestId('id')).toHaveTextContent('12')
  expect(screen.getByTestId('name')).toHaveTextContent('somename')
  expect(screen.getByTestId('capitalizedName')).toHaveTextContent('Somename')
  expect(screen.getByTestId('description')).toHaveTextContent('new description')
})

test('can connect logic without values/actions', () => {
  const { store } = getContext()

  const connectedLogic = kea({
    actions: () => ({
      updateDescription: (description) => ({ description }),
    }),

    reducers: ({ actions, props }) => ({
      description: [
        'default',
        PropTypes.string,
        {
          [actions.updateDescription]: (_, payload) => payload.description,
        },
      ],
    }),
  })

  const logic = kea({
    connect: {
      logic: [connectedLogic],
    },

    actions: () => ({
      updateName: (name) => ({ name }),
    }),

    reducers: ({ actions, props }) => ({
      name: [
        `chirpy-${props.id}`,
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),
  })

  logic({ id: 12 }).mount()

  expect(logic.values.name).toEqual('chirpy-12')
  expect(connectedLogic.values.description).toEqual('default')
})

test('can connect logic via array', () => {
  const { store } = getContext()

  const connectedLogic = kea({
    actions: () => ({
      updateDescription: (description) => ({ description }),
    }),

    reducers: ({ actions, props }) => ({
      description: [
        'default',
        PropTypes.string,
        {
          [actions.updateDescription]: (_, payload) => payload.description,
        },
      ],
    }),
  })

  const logic = kea({
    connect: [connectedLogic],

    actions: () => ({
      updateName: (name) => ({ name }),
    }),

    reducers: ({ actions, props }) => ({
      name: [
        `chirpy-${props.id}`,
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),
  })

  logic({ id: 12 }).mount()

  expect(logic.values.name).toEqual('chirpy-12')
  expect(connectedLogic.values.description).toEqual('default')
})
