/* global test, expect, beforeEach */
import { kea } from '../kea'
import { clearActionCache } from '../logic/actions'
import { keaSaga, keaReducer, clearStore } from '../scene/store'

import './helper/jsdom'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { mount } from 'enzyme'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'

beforeEach(() => {
  clearActionCache()
  clearStore()
})

function getStore () {
  clearActionCache()
  clearStore()

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)

  const store = finalCreateStore(reducers)

  sagaMiddleware.run(keaSaga)

  return store
}

class BookDetail extends Component {
  render () {
    const { book, bookId } = this.props
    return <div id={`book-${bookId}`}>{book}</div>
  }
}

test('selectors have access to the component\'s props', () => {
  const store = getStore()

  const books = {
    1: 'book1',
    2: 'book2'
  }

  const booksLogic = kea({
    reducers: ({ actions }) => ({
      books: [books, PropTypes.object, {}]
    })
  })

  const bookDetailLogic = kea({
    selectors: ({ selectors }) => ({
      book: [
        () => [booksLogic.selectors.books, (_, props) => props.bookId],
        (books, bookId) => books[bookId],
        PropTypes.object
      ]
    })
  })

  // make sure booksLogic has been mounted to the store by dispatching some random action
  // TODO: this should not be necessary!
  store.dispatch({ type: 'bla' })

  const ConnectedBookDetail = bookDetailLogic(BookDetail)

  const wrapper = mount(
    <Provider store={store}>
      <div className='playground-scene'>
        <ConnectedBookDetail bookId={1} />
        <ConnectedBookDetail bookId={2} />
      </div>
    </Provider>
  )

  expect(wrapper.find('#book-1').text()).toEqual('book1')
  expect(wrapper.find('#book-2').text()).toEqual('book2')
})
