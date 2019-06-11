/* global test, expect, beforeEach */
import { kea, getStore, resetContext, getContext } from '../index'

import './helper/jsdom'
import React from 'react'
import PropTypes from 'prop-types'
import { mount, configure } from 'enzyme'
import { Provider, batch } from 'react-redux'
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

test('it also works with dynamic logic (with reducers)', () => {
  const store = getStore()

  const containerLogic = kea({
    path: () => ['scenes', 'container'],

    actions: () => ({
      increment: true,
      removeElementById: (id) => ({ id }),
      addElement: (element) => ({ element }),
      updateAllNames: (name) => ({ name })
    }),

    reducers: ({ actions }) => ({
      elements: [{}, PropTypes.object, {
        [actions.addElement]: (state, payload) => ({ ...state, [payload.element.id]: payload.element }),
        [actions.updateAllNames]: (state, payload) => {
          let newState = {}
          Object.keys(state).forEach(key => {
            newState[key] = { ...state[key], name: payload.name }
          })
          return newState
        }
      }],
      deletedElements: [{}, PropTypes.object, {
        [actions.removeElementById]: (state, payload) => ({ ...state, [payload.id]: true })
      }],
      counter: [0, PropTypes.number, {
        [actions.increment]: (state) => state + 1
      }]
    })
  })

  const elementLogic = kea({
    connect: {
      props: [containerLogic, ['elements']],
      actions: [containerLogic, ['removeElementById', 'updateAllNames', 'increment']]
    },

    key: props => props.id,
    path: (key) => ['scenes', 'element', key],

    // this is the only line that is different in the 2 tests
    reducers: () => ({}),

    selectors: ({ selectors }) => ({
      element: [
        () => [selectors.elements, (_, props) => props.id],
        (elements, id) => elements[id],
        PropTypes.object
      ]
    })
  })

  const Element = elementLogic(({ id, element: { name }, actions: { removeElementById, updateAllNames, increment } }) => (
    <li id={`element-${id}`}>
      <span className='id'>{id}</span>
      <span className='name'>{name}</span>
      <button className='remove-and-rename-all' onClick={() => {
        removeElementById(id)
        updateAllNames('new')
        increment()
      }}>remove</button>
    </li>
  ))

  const ElementList = containerLogic(({ counter, elements, deletedElements, actions: { increment, removeElementById, addElement } }) => (
    <div>
      <div>
        <button id='add' onClick={() => {
          sampleElements.forEach(element => {
            addElement(element)
          })
          increment()
        }}>add</button>
        <button id='increment' onClick={increment}>{ counter }</button>
      </div>
      <ul>
        {Object.values(elements).map(({ id }) => !deletedElements[id] ? <Element key={id} id={id} /> : null)}
      </ul>
    </div>
  ))

  const sampleElements = [
    { id: '1', name: 'first' },
    { id: '2', name: 'second' },
    { id: '3', name: 'third' },
    { id: '4', name: 'fourth' },
    { id: '5', name: 'fifth' }
  ]

  const wrapper = mount(
    <Provider store={store}>
      <ElementList />
    </Provider>
  )

  expect(wrapper.find('.name').map(a => a.text())).toEqual([])
  expect(wrapper.find('#increment').text()).toEqual('0')

  // click to add elements
  wrapper.find('#add').simulate('click')

  expect(wrapper.find('.name').map(a => a.text())).toEqual(['first', 'second', 'third', 'fourth', 'fifth'])
  expect(wrapper.find('#increment').text()).toEqual('1')

  // click to remove #2 and change the name of all to 'new
  wrapper.find('#element-2 .remove-and-rename-all').simulate('click')

  expect(wrapper.find('#increment').text()).toEqual('2')
  expect(wrapper.find('.name').map(a => a.text())).toEqual(['new', 'new', 'new', 'new'])

  // increment to refresh the page
  wrapper.find('#increment').simulate('click')

  expect(wrapper.find('#increment').text()).toEqual('3')
  expect(wrapper.find('.name').map(a => a.text())).toEqual(['new', 'new', 'new', 'new'])

  wrapper.unmount()
})

// TODO: This seems to be a bug or misunderstanding on how react-redux's subscriptions work.
// Somehow the nested connect components' mapStateToProps gets only called once if we
// run multiple actions in an onClick(() => { ... })
test.skip('it also works with dynamic logic (without reducers)', () => {
  const store = getStore()

  const containerLogic = kea({
    path: () => ['scenes', 'container'],

    actions: () => ({
      increment: true,
      removeElementById: (id) => ({ id }),
      addElement: (element) => ({ element }),
      updateAllNames: (name) => ({ name })
    }),

    reducers: ({ actions }) => ({
      elements: [{}, PropTypes.object, {
        [actions.addElement]: (state, payload) => ({ ...state, [payload.element.id]: payload.element }),
        [actions.updateAllNames]: (state, payload) => {
          console.log('reducer for update all names')
          let newState = {}
          Object.keys(state).forEach(key => {
            newState[key] = { ...state[key], name: payload.name }
          })
          return newState
        }
      }],
      deletedElements: [{}, PropTypes.object, {
        [actions.removeElementById]: (state, payload) => {
          console.log('reducer for removeElementById')
          return ({ ...state, [payload.id]: true })
        }
      }],
      counter: [0, PropTypes.number, {
        [actions.increment]: (state) => state + 1
      }]
    })
  })

  const elementLogic = kea({
    connect: {
      props: [containerLogic, ['elements']],
      actions: [containerLogic, ['removeElementById', 'updateAllNames', 'increment']]
    },

    key: props => props.id,
    path: (key) => ['scenes', 'element', key],

    // this is the only line that is different in the 2 tests
    // reducers: () => ({}),

    selectors: ({ selectors }) => ({
      element: [
        () => [selectors.elements, (_, props) => props.id],
        (elements, id) => elements[id],
        PropTypes.object
      ]
    })
  })

  const Element = elementLogic(({ id, element: { name }, actions: { removeElementById, updateAllNames, increment } }) => (
    <li id={`element-${id}`}>
      <span className='id'>{id}</span>
      <span className='name'>{name}</span>
      <button className='remove-and-rename-all' onClick={() => {
        // with or without batch, there's no difference
        batch(() => {
          // this calls mapStateToProps on everything:
          // console.log src/kea/index.js:25
          // mapStateToProps scenes.container

          // console.log src/kea/index.js:25
          // mapStateToProps scenes.element.1

          // console.log src/kea/index.js:25
          // mapStateToProps scenes.element.2

          // console.log src/kea/index.js:25
          // mapStateToProps scenes.element.3

          // console.log src/kea/index.js:25
          // mapStateToProps scenes.element.4

          // console.log src/kea/index.js:25
          // mapStateToProps scenes.element.5

          console.log('running removeElementById(id)')
          removeElementById(id)

          // this calls mapStateToProps on just the container:
          // console.log src/kea/index.js:25
          // mapStateToProps scenes.container

          console.log('running updateAllNames(new)')
          updateAllNames('new')

          // this calls mapStateToProps on just the container:
          // console.log src/kea/index.js:25
          // mapStateToProps scenes.container
          console.log('running increment')
          increment()

          console.log('done with actions')
        })
      }}>remove</button>
    </li>
  ))

  const ElementList = containerLogic(({ counter, elements, deletedElements, actions: { increment, addElement } }) => (
    <div>
      <div>
        <button id='add' onClick={() => {
          sampleElements.forEach(element => {
            addElement(element)
          })
          increment()
        }}>add</button>
        <button id='increment' onClick={increment}>{ counter }</button>
      </div>
      <ul>
        {Object.values(elements).map(({ id }) => !deletedElements[id] ? <Element key={id} id={id} /> : null)}
      </ul>
    </div>
  ))

  const sampleElements = [
    { id: '1', name: 'first' },
    { id: '2', name: 'second' },
    { id: '3', name: 'third' },
    { id: '4', name: 'fourth' },
    { id: '5', name: 'fifth' }
  ]

  const wrapper = mount(
    <Provider store={store}>
      <ElementList />
    </Provider>
  )

  expect(wrapper.find('.name').map(a => a.text())).toEqual([])
  expect(wrapper.find('#increment').text()).toEqual('0')

  // click to add elements
  wrapper.find('#add').simulate('click')

  expect(wrapper.find('.name').map(a => a.text())).toEqual(['first', 'second', 'third', 'fourth', 'fifth'])
  expect(wrapper.find('#increment').text()).toEqual('1')

  // click to remove #2 and change the name of all to 'new'
  console.log('! clicking the remove and rename all button')
  wrapper.find('#element-2 .remove-and-rename-all').simulate('click')

  expect(wrapper.find('#increment').text()).toEqual('2')
  console.log(store.getState().scenes.container.elements)
  expect(wrapper.find('.name').map(a => a.text())).toEqual(['new', 'new', 'new', 'new'])

  // increment to refresh the page
  wrapper.find('#increment').simulate('click')

  expect(wrapper.find('#increment').text()).toEqual('3')
  expect(wrapper.find('.name').map(a => a.text())).toEqual(['new', 'new', 'new', 'new'])

  wrapper.unmount()
})
