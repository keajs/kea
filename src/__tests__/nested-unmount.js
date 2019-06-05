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

test('updating state to remove logic from react unmounts neatly', () => {
  const store = getStore()

  // inner

  const innerLogic = kea({
    actions: () => ({
      updateName: name => ({ name })
    }),
    reducers: ({ actions, props, key }) => ({
      name: ['George', PropTypes.string, {
        [actions.updateName]: (_, payload) => payload.name
      }]
    })
  })

  const InnerComponent = ({ name, actions: { updateName } }) => (
    <div>
      <div className='name'>{name}</div>
      <div className='update-name'></div>
    </div>
  )

  const ConnectedInnerComponent = innerLogic(InnerComponent)

  // outer

  const outerLogic = kea({
    actions: () => ({
      showInner: true,
      hideInner: true
    }),
    reducers: ({ actions, props, key }) => ({
      innerShown: [true, PropTypes.bool, {
        [actions.showInner]: () => true,
        [actions.hideInner]: () => false
      }]
    })
  })

  const OuterComponent = ({ innerShown, actions: { showInner, hideInner } }) => (
    <div>
      <div className='inner-shown'>{innerShown ? 'true' : 'false'}</div>
      <div className='inner-hide'><button onClick={hideInner}>hide</button></div>
      <div className='inner-show'><button onClick={showInner}>show</button></div>
      <div className='inner-div'>{innerShown ? <ConnectedInnerComponent /> : null}</div>
    </div>
  )

  const ConnectedOuterComponent = outerLogic(OuterComponent)

  // start

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedOuterComponent />
    </Provider>
  )

  expect(wrapper.find('.inner-shown').text()).toEqual('true')
  expect(wrapper.find('.name').text()).toEqual('George')

  wrapper.find('.inner-hide button').simulate('click')

  expect(wrapper.find('.inner-shown').text()).toEqual('false')
  expect(wrapper.exists('.name')).toEqual(false)

  wrapper.unmount()
})

test('swapping out connected logic gives the right state', () => {
  const store = getStore()

  const outerLogic = kea({
    actions: () => ({
      showEdit: true,
      hideEdit: true,
      updateName: name => ({ name })
    }),
    reducers: ({ actions, props, key }) => ({
      editShown: [false, PropTypes.bool, {
        [actions.showEdit]: () => true,
        [actions.hideEdit]: () => false
      }],
      name: ['Bob', PropTypes.string, {
        [actions.updateName]: (_, payload) => payload.name
      }]
    })
  })

  const editLogic = kea({
    connect: {
      props: [outerLogic, ['name']],
      actions: [outerLogic, ['updateName', 'hideEdit']]
    }
  })

  const EditComponent = ({ name, actions: { updateName, hideEdit } }) => (
    <div>
      <div className='name'>{name}</div>
      <button className='save-and-close' onClick={() => { updateName('George'); hideEdit() }}>hide</button>
    </div>
  )

  const ConnectedEditComponent = editLogic(EditComponent)

  const showLogic = kea({
    connect: {
      props: [outerLogic, ['name']]
    }
  })

  const ShowComponent = ({ name }) => (
    <div>
      <div className='name'>{name}</div>
    </div>
  )

  const ConnectedShowComponent = showLogic(ShowComponent)

  const OuterComponent = ({ editShown, actions: { showEdit } }) => (
    <div>
      <div className='edit-shown'>{editShown ? 'true' : 'false'}</div>
      <div className='edit-show'><button onClick={showEdit}>show</button></div>
      <div className='edit-div'>{editShown ? <ConnectedEditComponent /> : <ConnectedShowComponent />}</div>
    </div>
  )

  const ConnectedOuterComponent = outerLogic(OuterComponent)

  // start

  const wrapper = mount(
    <Provider store={store}>
      <ConnectedOuterComponent />
    </Provider>
  )

  expect(wrapper.find('.edit-shown').text()).toEqual('false')
  expect(wrapper.find('.name').text()).toEqual('Bob')

  wrapper.find('.edit-show button').simulate('click')

  expect(wrapper.find('.edit-shown').text()).toEqual('true')
  expect(wrapper.find('.name').text()).toEqual('Bob')

  wrapper.find('.save-and-close').simulate('click')

  expect(wrapper.find('.edit-shown').text()).toEqual('false')
  expect(wrapper.find('.name').text()).toEqual('George')

  wrapper.unmount()
})
