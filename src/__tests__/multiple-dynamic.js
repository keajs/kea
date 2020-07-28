/* global test, expect, beforeEach */
import { kea, resetContext, getContext } from '../index'

import './helper/jsdom'
import React from 'react'
import PropTypes from 'prop-types'
import { mount, configure } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetContext()
})

test('multiple dynamic logic stores', () => {
  const { store } = getContext()

  const dynamicLogic = kea({
    key: props => props.id,
    path: key => ['scenes', 'dynamic', key],
    actions: () => ({
      updateName: name => ({ name }),
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

  const SampleComponent = ({ id, name }) => (
    <div>
      <div className="id">{id}</div>
      <div className="name">{name}</div>
    </div>
  )

  const ConnectedComponent = dynamicLogic(SampleComponent)

  const allNames = [
    { id: 12, name: 'bla' },
    { id: 13, name: 'george' },
    { id: 15, name: 'michael' },
  ]

  const wrapper = mount(
    <Provider store={store}>
      {allNames.map(name => (
        <ConnectedComponent key={name.id} id={name.id} defaultName={name.name} />
      ))}
    </Provider>,
  )

  expect(wrapper.find('.id').length).toEqual(3)
  expect(wrapper.find('.name').length).toEqual(3)

  expect(
    wrapper
      .find('.id')
      .map(node => node.text())
      .join(','),
  ).toEqual('12,13,15')
  expect(
    wrapper
      .find('.name')
      .map(node => node.text())
      .join(','),
  ).toEqual('bla,george,michael')

  expect(store.getState()).toEqual({
    kea: {},
    scenes: { dynamic: { 12: { name: 'bla' }, 13: { name: 'george' }, 15: { name: 'michael' } } },
  })

  dynamicLogic.build({ id: 12 }).actions.updateName('birb')

  expect(
    wrapper
      .find('.name')
      .map(node => node.text())
      .join(','),
  ).toEqual('birb,george,michael')

  expect(store.getState()).toEqual({
    kea: {},
    scenes: { dynamic: { 12: { name: 'birb' }, 13: { name: 'george' }, 15: { name: 'michael' } } },
  })

  wrapper.unmount()
})
