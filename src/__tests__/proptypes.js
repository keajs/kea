/* global test, expect, beforeEach */
import { getContext, kea, resetContext } from '../index'

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
  resetContext()
})

test('inject proptypes to react component', () => {
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
  const { store } = getContext()

  const otherLogic = kea({
    reducers: () => ({
      connectedReducer: [0, PropTypes.number, {}]
    })
  })

  const singletonLogic = kea({
    connect: {
      values: [otherLogic, ['connectedReducer']]
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

test('also works without proptypes', () => {
  const { store } = getContext()
  const logic = kea({
    actions: () => ({
      doSomething: true
    }),
    reducers: ({ actions }) => ({
      something: ['bla'],
      somethingElse: ['bla', {}],
      somethingMore: ['bla', {
        [actions.doSomething]: () => 'asd'
      }],
      evenMoreThings: ['whoop', { something: true }, {
        [actions.doSomething]: () => 'boop'
      }]
    }),
    selectors: ({ selectors }) => ({
      summary: [
        () => [selectors.somethingMore],
        (somethingMore) => somethingMore.toUpperCase()
      ]
    })
  })

  logic.mount()

  expect(logic.propTypes).toEqual({})

  expect(logic.selectors.something(store.getState())).toEqual('bla')
  expect(logic.selectors.somethingElse(store.getState())).toEqual('bla')
  expect(logic.selectors.somethingMore(store.getState())).toEqual('bla')
  expect(logic.selectors.evenMoreThings(store.getState())).toEqual('whoop')
  expect(logic.selectors.summary(store.getState())).toEqual('BLA')

  store.dispatch(logic.actionCreators.doSomething())

  expect(logic.selectors.something(store.getState())).toEqual('bla')
  expect(logic.selectors.somethingElse(store.getState())).toEqual('bla')
  expect(logic.selectors.somethingMore(store.getState())).toEqual('asd')
  expect(logic.selectors.evenMoreThings(store.getState())).toEqual('boop')
  expect(logic.selectors.summary(store.getState())).toEqual('ASD')

  expect(logic.values.something).toEqual('bla')
  expect(logic.values.somethingElse).toEqual('bla')
  expect(logic.values.somethingMore).toEqual('asd')
  expect(logic.values.evenMoreThings).toEqual('boop')
  expect(logic.values.summary).toEqual('ASD')
})