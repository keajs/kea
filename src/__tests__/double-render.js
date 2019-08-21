/* global test, expect, beforeEach */
import { kea, getStore, resetContext } from '../index'

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

test('does not double render with the same props', () => {
  const store = getStore()

  const logic = kea({
    path: () => ['scenes', 'lazy'],
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

  let countRendered = 0

  function SampleComponent ({ id, name, capitalizedName, upperCaseName, actions: { updateName } }) {
    countRendered += 1

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

  const ConnectedComponent = logic(SampleComponent)

  expect(countRendered).toEqual(0)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  )

  expect(countRendered).toEqual(1)

  store.dispatch({ type: 'nothing', payload: { } })
  expect(countRendered).toEqual(1)

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy')
  expect(wrapper.find('.upperCaseName').text()).toEqual('CHIRPY')

  expect(store.getState()).toEqual({ kea: {}, scenes: { lazy: { name: 'chirpy' } } })

  store.dispatch(logic.actionCreators.updateName('somename'))
  expect(countRendered).toEqual(2)

  logic.actions.updateName('somename')
  expect(countRendered).toEqual(2)

  store.dispatch(logic.actionCreators.updateName('somename3'))
  expect(countRendered).toEqual(3)

  expect(store.getState()).toEqual({ kea: {}, scenes: { lazy: { name: 'somename3' } } })

  wrapper.render()

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename3')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename3')
  expect(wrapper.find('.upperCaseName').text()).toEqual('SOMENAME3')

  wrapper.unmount()
})
