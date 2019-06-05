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
