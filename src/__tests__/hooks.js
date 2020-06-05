/* global test, expect, beforeEach */
import { kea, useValues, useAllValues, useActions, useKea, getContext, resetContext } from '../index'

import './helper/jsdom'
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { mount, configure } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'
import { act } from 'react-dom/test-utils'

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetContext({ createStore: true })
})

test('useValues and useActions hooks works', () => {
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
    const { name, capitalizedName, upperCaseName } = useValues(logic)
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
    logic.actions.updateName('somename')
  })

  expect(countRendered).toEqual(2)

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('somename')
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename')
  expect(wrapper.find('.upperCaseName').text()).toEqual('SOMENAME')

  act(() => {
    logic.actions.updateName('somename')
  })
  expect(countRendered).toEqual(2)

  act(() => {
    logic.actions.updateName('somename3')
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

test('useValues and useActions hooks accept logic built with props', () => {
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

    const { name, upperCaseName } = useValues(innerLogic)
    const { updateName } = useActions(innerLogic)

    return (
      <div>
        <div className='id'>{id}</div>
        <div className='name'>{name}</div>
        <div className='upperCaseName'>{upperCaseName}</div>
        <div className='updateName' onClick={() => updateName('fred')}>updateName</div>
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
  expect(wrapper.find('.name').text()).toEqual('fred')
  expect(wrapper.find('.upperCaseName').text()).toEqual('FRED')

  expect(store.getState()).toEqual({ kea: {}, scenes: { hooky: { 12: { name: 'fred' } } } })
})

test('can change key/path of logic once it has been accessed in a hook', () => {
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

    const { name, upperCaseName } = useValues(innerLogic)
    const { updateName } = useActions(innerLogic)

    return (
      <div>
        <div className='id'>{id}</div>
        <div className='name'>{name}</div>
        <div className='upperCaseName'>{upperCaseName}</div>
        <div className='updateName' onClick={() => updateName('fred')}>updateName</div>
      </div>
    )
  }

  const togglerLogic = kea({
    path: () => ['scenes', 'toggler'],
    actions: () => ({
      next: true
    }),
    reducers: ({ actions }) => ({
      id: [12, {
        [actions.next]: state => state + 1
      }]
    })
  })

  function TogglerComponent () {
    const { id } = useValues(togglerLogic)
    const { next } = useActions(togglerLogic)

    return (
      <div>
        <SampleComponent id={id} />
        <button className='next' onClick={next}>next</button>
      </div>
    )
  }

  let wrapper

  act(() => {
    wrapper = mount(
      <Provider store={getContext().store}>
        <TogglerComponent />
      </Provider>
    )
  })

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('brad')
  expect(wrapper.find('.upperCaseName').text()).toEqual('BRAD')

  expect(store.getState()).toEqual({ 
    kea: {}, 
    scenes: { 
      hooky: { 12: { name: 'brad' } },
      toggler: { id: 12 }
    }
  })

  act(() => {
    wrapper.find('.updateName').simulate('click')
  })

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('fred')
  expect(wrapper.find('.upperCaseName').text()).toEqual('FRED')

  expect(store.getState()).toEqual({ 
    kea: {}, 
    scenes: { 
      hooky: { 12: { name: 'fred' } },
      toggler: { id: 12 }
    }
  })

  act(() => {
    wrapper.find('.next').simulate('click')
  })

  expect(wrapper.find('.id').text()).toEqual('13')
  expect(wrapper.find('.name').text()).toEqual('brad')
  expect(wrapper.find('.upperCaseName').text()).toEqual('BRAD')

  expect(store.getState()).toEqual({ 
    kea: {}, 
    scenes: { 
      hooky: { 13: { name: 'brad' } },
      toggler: { id: 13 }
    }
  })
})

test('can define logic inline with useKea', () => {
  const { store } = getContext()

  function SampleComponent ({ id }) {
    const logic = useKea({
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
    const innerLogic = logic({ id, defaultName: 'brad' }) 

    const { name, upperCaseName } = useValues(innerLogic)
    const { updateName } = useActions(innerLogic)

    return (
      <div>
        <div className='id'>{id}</div>
        <div className='name'>{name}</div>
        <div className='upperCaseName'>{upperCaseName}</div>
        <div className='updateName' onClick={() => updateName('fred')}>updateName</div>
      </div>
    )
  }

  function TogglerComponent () {
    const togglerLogic = useKea({
      path: () => ['scenes', 'toggler'],
      actions: () => ({
        next: true
      }),
      reducers: ({ actions }) => ({
        id: [12, {
          [actions.next]: state => state + 1
        }]
      })
    })
  
    const { id } = useValues(togglerLogic)
    const { next } = useActions(togglerLogic)

    return (
      <div>
        <SampleComponent id={id} />
        <button className='next' onClick={next}>next</button>
      </div>
    )
  }

  let wrapper

  act(() => {
    wrapper = mount(
      <Provider store={getContext().store}>
        <TogglerComponent />
      </Provider>
    )
  })

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('brad')
  expect(wrapper.find('.upperCaseName').text()).toEqual('BRAD')

  expect(store.getState()).toEqual({ 
    kea: {}, 
    scenes: { 
      hooky: { 12: { name: 'brad' } },
      toggler: { id: 12 }
    }
  })

  act(() => {
    wrapper.find('.updateName').simulate('click')
  })

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('fred')
  expect(wrapper.find('.upperCaseName').text()).toEqual('FRED')

  expect(store.getState()).toEqual({ 
    kea: {}, 
    scenes: { 
      hooky: { 12: { name: 'fred' } },
      toggler: { id: 12 }
    }
  })

  act(() => {
    wrapper.find('.next').simulate('click')
  })

  expect(wrapper.find('.id').text()).toEqual('13')
  expect(wrapper.find('.name').text()).toEqual('brad')
  expect(wrapper.find('.upperCaseName').text()).toEqual('BRAD')

  expect(store.getState()).toEqual({ 
    kea: {}, 
    scenes: { 
      hooky: { 13: { name: 'brad' } },
      toggler: { id: 13 }
    }
  })
})

test('can get all props with useAllValuess', () => {
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

    const allProps = useAllValues(innerLogic)

    const { name, upperCaseName } = allProps

    // extract the props a second time and expect nothing to break because of this
    if (id === 12) {
      const { name, upperCaseName } = allProps
      let a = name + upperCaseName
    }
    
    const { updateName } = useActions(innerLogic)

    return (
      <div>
        <div className='id'>{id}</div>
        <div className='name'>{name}</div>
        <div className='upperCaseName'>{upperCaseName}</div>
        <div className='updateName' onClick={() => updateName('fred')}>updateName</div>
      </div>
    )
  }

  const togglerLogic = kea({
    path: () => ['scenes', 'toggler'],
    actions: () => ({
      next: true
    }),
    reducers: ({ actions }) => ({
      id: [12, {
        [actions.next]: state => state + 1
      }]
    })
  })

  function TogglerComponent () {
    const { id } = useValues(togglerLogic)
    const { next } = useActions(togglerLogic)

    return (
      <div>
        <SampleComponent id={id} />
        <button className='next' onClick={next}>next</button>
      </div>
    )
  }

  let wrapper

  act(() => {
    wrapper = mount(
      <Provider store={getContext().store}>
        <TogglerComponent />
      </Provider>
    )
  })

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('brad')
  expect(wrapper.find('.upperCaseName').text()).toEqual('BRAD')

  expect(store.getState()).toEqual({ 
    kea: {}, 
    scenes: { 
      hooky: { 12: { name: 'brad' } },
      toggler: { id: 12 }
    }
  })

  act(() => {
    wrapper.find('.updateName').simulate('click')
  })

  expect(wrapper.find('.id').text()).toEqual('12')
  expect(wrapper.find('.name').text()).toEqual('fred')
  expect(wrapper.find('.upperCaseName').text()).toEqual('FRED')

  expect(store.getState()).toEqual({ 
    kea: {}, 
    scenes: { 
      hooky: { 12: { name: 'fred' } },
      toggler: { id: 12 }
    }
  })

  act(() => {
    wrapper.find('.next').simulate('click')
  })

  expect(wrapper.find('.id').text()).toEqual('13')
  expect(wrapper.find('.name').text()).toEqual('brad')
  expect(wrapper.find('.upperCaseName').text()).toEqual('BRAD')

  expect(store.getState()).toEqual({ 
    kea: {}, 
    scenes: { 
      hooky: { 13: { name: 'brad' } },
      toggler: { id: 13 }
    }
  })
})

test('will not crash hen running action after unmount', () => {
  const { store } = getContext()
  const logic = kea({
    actions: () => ({
      updateName: name => ({ name })
    }),
  })

  function SampleComponent ({ id }) {
    const { updateName } = useActions(logic)

    useEffect(() => {
      return () => updateName('yes')
    }, [])

    return <div/>
  }

  let wrapper

  act(() => {
    wrapper = mount(
      <Provider store={getContext().store}>
        <SampleComponent />
      </Provider>
    )
  })

  expect(() => {
    wrapper.unmount()
  }).not.toThrow()

})
