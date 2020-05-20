/* global test, expect, beforeEach */
import { kea, useValues, useActions, getContext, resetContext } from '../index'

import './helper/jsdom'
import React from 'react'
import PropTypes from 'prop-types'
import { mount, configure } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'
import { act } from 'react-dom/test-utils'

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetContext({ createStore: true })
})

test('can change key/path of logic once it has been wrapped', () => {
  const { store } = getContext()
  const logic = kea({
    key: props => props.id,
    path: key => ['scenes', 'wrappy', key],
    actions: () => ({
      updateName: name => ({ name }),
    }),
    reducers: ({ actions, props }) => ({
      name: [
        props.defaultName,
        PropTypes.string,
        {
          [actions.updateName]: (state, payload) => payload.name,
        },
      ],
    }),
    selectors: ({ selectors }) => ({
      upperCaseName: [
        () => [selectors.name],
        name => {
          return name.toUpperCase()
        },
        PropTypes.string,
      ],
    }),
  })

  function SampleComponent({ id, name, upperCaseName, actions: { updateName } }) {
    return (
      <div>
        <div className="id">{id}</div>
        <div className="name">{name}</div>
        <div className="upperCaseName">{upperCaseName}</div>
        <div className="updateName" onClick={() => updateName('fred')}>
          updateName
        </div>
      </div>
    )
  }

  const ConnectedSampleComponent = logic(SampleComponent)

  const togglerLogic = kea({
    path: () => ['scenes', 'toggler'],
    actions: () => ({
      next: true,
    }),
    reducers: ({ actions }) => ({
      id: [
        12,
        {
          [actions.next]: state => state + 1,
        },
      ],
    }),
  })

  function TogglerComponent() {
    const { id } = useValues(togglerLogic)
    const { next } = useActions(togglerLogic)

    return (
      <div>
        <ConnectedSampleComponent id={id} defaultName="brad" />
        <button className="next" onClick={next}>
          next
        </button>
      </div>
    )
  }

  let wrapper

  act(() => {
    wrapper = mount(
      <Provider store={getContext().store}>
        <TogglerComponent />
      </Provider>,
    )
  })

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('brad')
  expect(wrapper.find('.upperCaseName').text()).toEqual('BRAD')

  expect(store.getState()).toEqual({
    kea: {},
    scenes: {
      wrappy: { 12: { name: 'brad' } },
      toggler: { id: 12 },
    },
  })

  act(() => {
    wrapper.find('.updateName').simulate('click')
  })

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('fred')
  expect(wrapper.find('.upperCaseName').text()).toEqual('FRED')

  expect(store.getState()).toEqual({
    kea: {},
    scenes: {
      wrappy: { 12: { name: 'fred' } },
      toggler: { id: 12 },
    },
  })

  act(() => {
    wrapper.find('.next').simulate('click')
  })

  expect(wrapper.find('.id').text()).toEqual('13')
  expect(wrapper.find('.name').text()).toEqual('brad')
  expect(wrapper.find('.upperCaseName').text()).toEqual('BRAD')

  expect(store.getState()).toEqual({
    kea: {},
    scenes: {
      wrappy: { 13: { name: 'brad' } },
      toggler: { id: 13 },
    },
  })
})
