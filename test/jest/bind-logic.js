/* global test, expect, beforeEach */
import { kea, resetContext, getContext, useValues, BindLogic } from '../../src'

import './helper/jsdom'
import React, { useState } from 'react'
import { mount, configure } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'
import { act } from 'react-dom/test-utils'

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetContext()
})

test('multiple dynamic logic stores', () => {
  let setState
  const { store } = getContext()

  const allNames = [
    { id: 12, name: 'bla' },
    { id: 13, name: 'george' },
    { id: 15, name: 'michael' },
  ]

  const keyedLogic = kea({
    key: (props) => props.id,
    path: (key) => ['scenes', 'dynamic', key],
    actions: () => ({
      updateName: (name) => ({ name }),
    }),
    reducers: ({ actions, props }) => ({
      name: [
        allNames.find((n) => n.id === props.id)?.name || props.defaultName || '',
        {
          updateName: (_, { name }) => name,
        },
      ],
    }),
  })

  function App() {
    const [state, _setState] = useState({ firstId: 12, secondId: 15 })
    setState = (stateUpdate) => act(() => _setState({ ...state, ...stateUpdate }))

    const { firstId, secondId } = state

    return (
      <div>
        <BindLogic logic={keyedLogic} props={{ id: firstId }}>
          <DynamicComponent __debugId={firstId} />
        </BindLogic>
        <BindLogic logic={keyedLogic} props={{ id: secondId }}>
          <DynamicComponent __debugId={secondId} />
        </BindLogic>
      </div>
    )
  }

  function DynamicComponent({ __debugId }) {
    const { name } = useValues(keyedLogic)
    return <div className="name">{name}</div>
  }

  const wrapper = mount(
    <Provider store={store}>
      <App />
    </Provider>,
  )

  expect(wrapper.find('.name').length).toEqual(2)

  const findText = () =>
    wrapper
      .find('.name')
      .map((node) => node.text())
      .join(',')

  const getStoreActions = () => Object.keys(store.getState().scenes?.dynamic || {}).map((nr) => parseInt(nr))

  expect(findText()).toEqual('bla,michael')
  expect(getStoreActions()).toEqual([12, 15])

  const logic1 = keyedLogic({ id: 12 })
  const unmount1 = logic1.mount()

  expect(findText()).toEqual('bla,michael')
  logic1.actions.updateName('haha')
  expect(findText()).toEqual('haha,michael')
  expect(getStoreActions()).toEqual([12, 15])
  unmount1()

  const logic2 = keyedLogic({ id: 15 })
  const unmount2 = logic2.mount()
  logic2.actions.updateName('hoho')
  expect(findText()).toEqual('haha,hoho')
  expect(getStoreActions()).toEqual([12, 15])
  unmount2()

  setState({ firstId: 13 })

  expect(findText()).toEqual('george,hoho')

  expect(getStoreActions()).toEqual([13, 15])

  wrapper.unmount()
})
