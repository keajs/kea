/* global test, expect, beforeEach */
import { kea, resetContext, getContext } from '../../src'

import './helper/jsdom'
import React from 'react'
import { Provider } from 'react-redux'
import { render, screen } from '@testing-library/react'
describe('lazy logic', () => {
  test('eager logic loading works', () => {
    resetContext({ autoMount: true })

    const { store } = getContext()

    const logic = kea({
      path: () => ['scenes', 'eager'],
      actions: () => ({
        updateName: (name) => ({ name }),
      }),
      reducers: ({ actions }) => ({
        name: [
          'chirpy',
          {
            [actions.updateName]: (state, payload) => payload.name,
          },
        ],
      }),
      selectors: ({ selectors }) => ({
        upperCaseName: [
          () => [selectors.capitalizedName],
          (capitalizedName) => {
            return capitalizedName.toUpperCase()
          },
        ],
        capitalizedName: [
          () => [selectors.name],
          (name) => {
            return name
              .trim()
              .split(' ')
              .map((k) => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`)
              .join(' ')
          },
        ],
      }),
    })

    // chirpy is already in the store
    expect(store.getState()).toEqual({ kea: {}, scenes: { eager: { name: 'chirpy' } } })

    const SampleComponent = ({ id, name, capitalizedName, upperCaseName, actions: { updateName } }) => (
      <div>
        <div data-testid="id">{id}</div>
        <div data-testid="name">{name}</div>
        <div data-testid="capitalizedName">{capitalizedName}</div>
        <div data-testid="upperCaseName">{upperCaseName}</div>
        <div data-testid="updateName" onClick={updateName}>
          updateName
        </div>
      </div>
    )

    const ConnectedComponent = logic(SampleComponent)

    render(
      <Provider store={store}>
        <ConnectedComponent id={12} />
      </Provider>,
    )

    expect(screen.getByTestId('id')).toHaveTextContent('12')
    expect(screen.getByTestId('name')).toHaveTextContent('chirpy')
    expect(screen.getByTestId('capitalizedName')).toHaveTextContent('Chirpy')
    expect(screen.getByTestId('upperCaseName')).toHaveTextContent('CHIRPY')

    expect(store.getState()).toEqual({ kea: {}, scenes: { eager: { name: 'chirpy' } } })

    logic.actions.updateName('somename')

    expect(store.getState()).toEqual({ kea: {}, scenes: { eager: { name: 'somename' } } })

    expect(screen.getByTestId('id')).toHaveTextContent('12')
    expect(screen.getByTestId('name')).toHaveTextContent('somename')
    expect(screen.getByTestId('capitalizedName')).toHaveTextContent('Somename')
    expect(screen.getByTestId('upperCaseName')).toHaveTextContent('SOMENAME')

    // logic remains in the store
    expect(store.getState()).toEqual({ kea: {}, scenes: { eager: { name: 'somename' } } })
  })

  test('lazy logic loading works', () => {
    const { store } = resetContext({ autoMount: false })

    const logic = kea({
      path: () => ['scenes', 'lazy'],
      actions: () => ({
        updateName: (name) => ({ name }),
      }),
      reducers: ({ actions }) => ({
        name: [
          'chirpy',
          {
            [actions.updateName]: (state, payload) => payload.name,
          },
        ],
      }),
      selectors: ({ selectors }) => ({
        upperCaseName: [
          () => [selectors.capitalizedName],
          (capitalizedName) => {
            return capitalizedName.toUpperCase()
          },
        ],
        capitalizedName: [
          () => [selectors.name],
          (name) => {
            return name
              .trim()
              .split(' ')
              .map((k) => `${k.charAt(0).toUpperCase()}${k.slice(1).toLowerCase()}`)
              .join(' ')
          },
        ],
      }),
    })

    // nothing yet in the store
    expect(store.getState()).toEqual({ kea: {} })

    const SampleComponent = ({ id, name, capitalizedName, upperCaseName, actions: { updateName } }) => (
      <div>
        <div data-testid="id">{id}</div>
        <div data-testid="name">{name}</div>
        <div data-testid="capitalizedName">{capitalizedName}</div>
        <div data-testid="upperCaseName">{upperCaseName}</div>
        <div data-testid="updateName" onClick={updateName}>
          updateName
        </div>
      </div>
    )

    const ConnectedComponent = logic(SampleComponent)

    render(
      <Provider store={store}>
        <ConnectedComponent id={12} />
      </Provider>,
    )

    expect(screen.getByTestId('id')).toHaveTextContent('12')
    expect(screen.getByTestId('name')).toHaveTextContent('chirpy')
    expect(screen.getByTestId('capitalizedName')).toHaveTextContent('Chirpy')
    expect(screen.getByTestId('upperCaseName')).toHaveTextContent('CHIRPY')

    expect(store.getState()).toEqual({ kea: {}, scenes: { lazy: { name: 'chirpy' } } })

    logic.actions.updateName('somename')

    expect(store.getState()).toEqual({ kea: {}, scenes: { lazy: { name: 'somename' } } })

    expect(screen.getByTestId('id')).toHaveTextContent('12')
    expect(screen.getByTestId('name')).toHaveTextContent('somename')
    expect(screen.getByTestId('capitalizedName')).toHaveTextContent('Somename')
    expect(screen.getByTestId('upperCaseName')).toHaveTextContent('SOMENAME')
  })
})
