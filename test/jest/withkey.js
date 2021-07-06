/* global test, expect, beforeEach */
import { kea, resetContext, getContext } from '../../src'

import './helper/jsdom'
import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { render, screen } from '@testing-library/react'

beforeEach(() => {
  resetContext()
})

test('can use withkey for actions and props', () => {
  const { store } = getContext()

  const dynamicLogic = kea({
    key: (props) => props.id,
    path: (key) => ['scenes', 'dynamic', key],

    actions: () => ({
      updateName: (name) => ({ name }),
    }),

    reducers: ({ actions, props, key }) => ({
      name: [
        props.defaultName,
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),
  })

  const connectedLogic = kea({
    connect: ({ id, defaultName }) => ({
      values: [dynamicLogic({ id, defaultName }), ['name']],
      actions: [dynamicLogic({ id, defaultName }), ['updateName']],
    }),
  })

  const SampleComponent = ({ id, name }) => (
    <div>
      <div data-testid="id">{id}</div>
      <div data-testid="name">{name}</div>
    </div>
  )

  const ConnectedComponent = connectedLogic(SampleComponent)

  render(
    <Provider store={store}>
      <ConnectedComponent id="12" defaultName="defaultName" />
    </Provider>,
  )

  expect(screen.getByTestId('id')).toHaveTextContent('12')
  expect(screen.getByTestId('name')).toHaveTextContent('defaultName')

  expect(store.getState()).toEqual({ kea: {}, scenes: { dynamic: { 12: { name: 'defaultName' } } } })

  dynamicLogic({ id: 12 }).actions.updateName('birb')

  expect(store.getState()).toEqual({ kea: {}, scenes: { dynamic: { 12: { name: 'birb' } } } })

  expect(screen.getByTestId('id')).toHaveTextContent('12')
  expect(screen.getByTestId('name')).toHaveTextContent('birb')
})
