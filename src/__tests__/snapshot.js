/* global test, expect, beforeEach */
import { kea, resetContext, getContext } from '../index'

import './helper/jsdom'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import renderer from 'react-test-renderer'

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
  resetContext()
})

test('snapshots must match', () => {
  const { store } = getContext()

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

  const tree = renderer.create(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  ).toJSON()

  expect(tree).toMatchSnapshot()
})
