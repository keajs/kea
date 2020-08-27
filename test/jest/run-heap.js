/* global test, expect, beforeEach */
import './helper/jsdom'
import { getContext, resetContext } from '../../src/context'
import React from 'react'
import { kea } from '../../src/kea'
import { useValues } from '../../src'
import { act } from 'react-dom/test-utils'
import { configure, mount } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetContext()
})

test('run heap works with actions - build is not autoconnected via react', () => {
  const rootLogic = kea({
    path: () => ['scenes', 'root'],
    actions: () => ({
      loadScene: scene => ({ scene }),
      setScene: scene => ({ scene }),
    }),
    reducers: () => ({ scene: ['home', { setScene: (_, { scene }) => scene }] }),

    listeners: ({ actions }) => ({
      loadScene: ({ scene }) => {
        actions.setScene(scene)
      },
    }),
  })

  const dashLogic = kea({
    path: () => ['scenes', 'dash'],
    reducers: () => ({ dashValue: ['present'] }),
  })

  function DashComponent() {
    const { dashValue } = useValues(dashLogic())
    return <div id="dashboard">{dashValue}</div>
  }

  function HomeComponent() {
    return <div id="homepage">On Home</div>
  }

  function RootComponent() {
    const { scene } = useValues(rootLogic)
    return (
      <div>
        <div id="scene">{scene}</div>
        {scene === 'home' ? <HomeComponent /> : null}
        {scene === 'dash' ? <DashComponent /> : null}
      </div>
    )
  }

  let wrapper

  act(() => {
    wrapper = mount(
      <Provider store={getContext().store}>
        <RootComponent />
      </Provider>,
    )
  })

  expect(wrapper.find('#scene').text()).toEqual('home')
  expect(wrapper.find('#homepage').length).toEqual(1)
  expect(wrapper.find('#dashboard').length).toEqual(0)

  expect(getContext().mount.counter).toEqual({ 'scenes.root': 1 })

  rootLogic.actions.loadScene('dash')

  expect(getContext().mount.counter).toEqual({ 'scenes.dash': 1, 'scenes.root': 1 })
})
