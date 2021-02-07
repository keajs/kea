/* global test, expect, beforeEach */
import { kea, resetContext, getContext, useValues, BindProps } from '../../src'

import './helper/jsdom'
import React from 'react'
import { mount, configure } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetContext()
})

test('multiple dynamic logic stores', () => {
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
        allNames.find((n) => n.id === props.id).name,
        {
          [actions.updateName]: (state, { name }) => name,
        },
      ],
    }),
  })

  function App() {
    return (
      <div>
        <BindProps logic={keyedLogic} props={{ id: 12 }}>
          <DynamicComponent />
        </BindProps>
        <BindProps logic={keyedLogic} props={{ id: 15 }}>
          <DynamicComponent />
        </BindProps>
      </div>
    )
  }

  function DynamicComponent() {
    const { name, id } = useValues(keyedLogic)
    return (
      <div id={`dynamic-${id}`}>
        <div className="id">{id}</div>
        <div className="name">{name}</div>
      </div>
    )
  }

  const wrapper = mount(
    <Provider store={store}>
      <App />
    </Provider>,
  )

  expect(wrapper.find('.id').length).toEqual(2)
  expect(wrapper.find('.name').length).toEqual(2)

  const findText = (selector) =>
    wrapper
      .find(selector)
      .map((node) => node.text())
      .join(',')

  expect(findText('.name')).toEqual('bla,michael')

  wrapper.unmount()
})
