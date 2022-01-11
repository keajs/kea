/* global test, expect, beforeEach */
import './helper/jsdom'
import { getContext, resetContext, kea, useValues } from '../../src'
import React from 'react'
import { Provider } from 'react-redux'
import { render, screen } from '@testing-library/react'
import { delay } from './helper/delay'

beforeEach(() => {
  resetContext()
})

describe('run heap', () => {
  test('run heap works with actions - build is not autoconnected via react', () => {
    const rootLogic = kea({
      path: () => ['scenes', 'root'],
      actions: () => ({
        loadScene: (scene) => ({ scene }),
        setScene: (scene) => ({ scene }),
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
      return <div data-testid="dashboard">{dashValue}</div>
    }

    function HomeComponent() {
      return <div data-testid="homepage">On Home</div>
    }

    function RootComponent() {
      const { scene } = useValues(rootLogic)
      return (
        <div>
          <div data-testid="scene">{scene}</div>
          {scene === 'home' ? <HomeComponent /> : null}😇
          {scene === 'dash' ? <DashComponent /> : null}
        </div>
      )
    }

    render(
      <Provider store={getContext().store}>
        <RootComponent />
      </Provider>,
    )

    expect(screen.getByTestId('scene')).toHaveTextContent('home')
    expect(screen.getByTestId('homepage')).toHaveTextContent('On Home')
    expect(screen.queryByTestId('dashboard')).toEqual(null)

    expect(getContext().mount.counter).toEqual({ 'scenes.root': 1 })

    rootLogic.actions.loadScene('dash')

    expect(getContext().mount.counter).toEqual({ 'scenes.dash': 1, 'scenes.root': 1 })
  })

  test('works with async listeners', async () => {
    let testRan = false
    const logic1 = kea({
      key: (props) => props.id,
      path: (key) => ['logic1', key],
      actions: { doSomething: true },
      reducers: ({ props }) => ({ data: [`data1.${props.id}`, {}] }),
      listeners: ({ values }) => ({
        doSomething: async (_, breakpoint) => {
          expect(getContext().run.heap.length).toBeGreaterThan(0)
          await breakpoint(1)
          expect(getContext().run.heap.length).toBeGreaterThan(0)
          expect(values.data).toEqual('data1.3')
          expect(logic1({ id: 3 }).values.data).toEqual('data1.3')
          expect(logic1.values.data).toEqual('data1.3')
          testRan = true
        },
      }),
    })

    logic1({ id: 3 }).mount()
    logic1({ id: 3 }).actions.doSomething()

    await delay(100)
    expect(testRan).toEqual(true)
  })
})
