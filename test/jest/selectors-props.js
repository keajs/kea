/* global test, expect, beforeEach */
import { kea, resetContext, getContext } from '../../src'

import './helper/jsdom'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { mount, configure } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

beforeEach(() => {
  resetContext({ autoMount: true })
})

class BookDetail extends Component {
  render() {
    const { book, bookId } = this.props
    return <div id={`book-${bookId}`}>{book}</div>
  }
}

test("selectors have access to the component's props", () => {
  const { store } = getContext()

  const books = {
    1: 'book1',
    2: 'book2',
  }

  const booksLogic = kea({
    reducers: ({ actions }) => ({
      books: [books, PropTypes.object, {}],
    }),
  })

  const bookDetailLogic = kea({
    selectors: ({ selectors }) => ({
      book: [
        () => [booksLogic.selectors.books, (_, props) => props.bookId],
        (books, bookId) => books[bookId],
        PropTypes.string,
      ],
    }),
  })

  const ConnectedBookDetail = bookDetailLogic(BookDetail)

  const wrapper = mount(
    <Provider store={store}>
      <div className="playground-scene">
        <ConnectedBookDetail bookId={1} />
        <ConnectedBookDetail bookId={2} />
      </div>
    </Provider>,
  )

  expect(wrapper.find('#book-1').text()).toEqual('book1')
  expect(wrapper.find('#book-2').text()).toEqual('book2')

  // only one of the components should be in the store, as only one has a reducer
  expect(Object.keys(store.getState().kea.logic).length).toEqual(1)

  wrapper.unmount()
})
