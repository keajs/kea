/* global test, expect, beforeEach */
import { kea, getStore, resetKeaCache } from '../index'

import './helper/jsdom'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { mount, configure } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

class SampleComponent extends Component {
  static propTypes = {
    id: PropTypes.number
  }

  render () {
    const { id, name, capitalizedName, upperCaseName } = this.props
    const { updateName } = this.actions

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
}
class OtherComponent extends Component {
  static propTypes = {
    id: PropTypes.number
  }

  render () {
    const { id, name, capitalizedName, upperCaseName } = this.props
    const { updateName } = this.actions

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
}

beforeEach(() => {
  resetKeaCache()
})

test('inject proptypes to react component', () => {
  const store = getStore()

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

  expect(Object.keys(SampleComponent.propTypes).sort()).toEqual(['id'])

  const ConnectedComponent = singletonLogic(SampleComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  )

  expect(Object.keys(SampleComponent.propTypes).sort()).toEqual(['capitalizedName', 'id', 'name', 'upperCaseName'])

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy')
})

test('get connected proptyes', () => {
  const store = getStore()

  const otherLogic = kea({
    reducers: () => ({
      connectedReducer: [0, PropTypes.number, {}]
    })
  })

  const singletonLogic = kea({
    connect: {
      props: [otherLogic, ['connectedReducer']]
    },

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

  expect(Object.keys(OtherComponent.propTypes).sort()).toEqual(['id'])

  const ConnectedComponent = singletonLogic(OtherComponent)

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedComponent id={12} />
    </Provider>
  )


  expect(Object.keys(OtherComponent.propTypes).sort()).toEqual(['capitalizedName', 'connectedReducer', 'id', 'name', 'upperCaseName'])

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy')
})
