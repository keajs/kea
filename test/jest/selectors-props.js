/* global test, expect, beforeEach */
import { kea, resetContext, getContext } from '../../src'

import './helper/jsdom'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { render, screen } from '@testing-library/react'

beforeEach(() => {
  resetContext({ autoMount: true })
})

class BookDetail extends Component {
  render() {
    const { book, bookId } = this.props
    return <div data-testid={`book-${bookId}`}>{book}</div>
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

  render(
    <Provider store={store}>
      <div className="playground-scene">
        <ConnectedBookDetail bookId={1} />
        <ConnectedBookDetail bookId={2} />
      </div>
    </Provider>,
  )

  expect(screen.getByTestId('book-1')).toHaveTextContent('book1')
  expect(screen.getByTestId('book-2')).toHaveTextContent('book2')

  // only one of the components should be in the store, as only one has a reducer
  expect(Object.keys(store.getState().kea.logic).length).toEqual(1)
})
