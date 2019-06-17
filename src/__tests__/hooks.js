/* global test, expect, beforeEach */
import { kea, useProps, useActions, getContext, resetContext } from '../index'

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

test('useProps and useActions hooks works', () => {
  const { store } = getContext()
  const logic = kea({
    path: () => ['scenes', 'hooky'],
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions }) => ({
      name: ['chirpy', PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),
    selectors: ({ selectors }) => ({
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

  function SampleComponent ({ id }) {
    const { name, capitalizedName, upperCaseName } = useProps(logic)
    const { updateName } = useActions(logic)

    countRendered += 1

    return (
      <div>
        <div className='id'>{id}</div>
        <div className='name'>{name}</div>
        <div className='capitalizedName'>{capitalizedName}</div>
        <div className='upperCaseName'>{upperCaseName}</div>
        <div className='updateName' onClick={() => updateName('bob')}>updateName</div>
      </div>
    )
  }

  expect(countRendered).toEqual(0)

  let wrapper

  act(() => {
    wrapper = mount(
      <Provider store={getContext().store}>
        <SampleComponent id={12} />
      </Provider>
    )
  })

  expect(countRendered).toEqual(1)

  act(() => {
    store.dispatch({ type: 'nothing', payload: { } })
  })
  expect(countRendered).toEqual(1)

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('chirpy')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy')
  expect(wrapper.find('.upperCaseName').text()).toEqual('CHIRPY')

  expect(store.getState()).toEqual({ kea: {}, scenes: { hooky: { name: 'chirpy' } } })

  act(() => {
    store.dispatch(logic.actions.updateName('somename'))
  })

  expect(countRendered).toEqual(2)

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename')
  expect(wrapper.find('.upperCaseName').text()).toEqual('SOMENAME')

  act(() => {
    store.dispatch(logic.actions.updateName('somename'))
  })
  expect(countRendered).toEqual(2)

  act(() => {
    store.dispatch(logic.actions.updateName('somename3'))
  })
  expect(countRendered).toEqual(3)

  expect(store.getState()).toEqual({ kea: {}, scenes: { hooky: { name: 'somename3' } } })

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename3')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename3')
  expect(wrapper.find('.upperCaseName').text()).toEqual('SOMENAME3')

  act(() => {
    wrapper.find('.updateName').simulate('click')
  })
  expect(countRendered).toEqual(4)

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('bob')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Bob')
  expect(wrapper.find('.upperCaseName').text()).toEqual('BOB')

  wrapper.unmount()
})

test('useProps and useActions hooks accept logic built with props', () => {
  const { store } = getContext()
  const logic = kea({
    key: props => props.id,
    path: key => ['scenes', 'hooky', key],
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, props }) => ({
      name: [props.defaultName, PropTypes.string, {
        [actions.updateName]: (state, payload) => payload.name
      }]
    }),
    selectors: ({ selectors }) => ({
      upperCaseName: [
        () => [selectors.name],
        (name) => {
          return name.toUpperCase()
        },
        PropTypes.string
      ]
    })
  })


  function SampleComponent ({ id }) {
    const innerLogic = logic({ id, defaultName: 'brad' }) 

    const { name, upperCaseName } = useProps(innerLogic)
    const { updateName } = useActions(innerLogic)

    return (
      <div>
        <div className='id'>{id}</div>
        <div className='name'>{name}</div>
        <div className='upperCaseName'>{upperCaseName}</div>
        <div className='updateName' onClick={() => updateName('eva')}>updateName</div>
      </div>
    )
  }

  let wrapper

  act(() => {
    wrapper = mount(
      <Provider store={getContext().store}>
        <SampleComponent id={12} />
      </Provider>
    )
  })

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('brad')
  expect(wrapper.find('.upperCaseName').text()).toEqual('BRAD')

  expect(store.getState()).toEqual({ kea: {}, scenes: { hooky: { 12: { name: 'brad' } } } })

  act(() => {
    wrapper.find('.updateName').simulate('click')
  })

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('eva')
  expect(wrapper.find('.upperCaseName').text()).toEqual('EVA')

  expect(store.getState()).toEqual({ kea: {}, scenes: { hooky: { 12: { name: 'eva' } } } })
})
