/* global test, expect, beforeEach */
import { kea, resetContext, getStore } from '../index'

import PropTypes from 'prop-types'

beforeEach(() => {
  resetContext({ createStore: true })
})

test('selectors have the store as a default', () => {
  const books = {
    1: 'book1',
    2: 'book2',
  }

  const logic = kea({
    reducers: ({ actions }) => ({
      books: [books, PropTypes.object, {}],
      bookId: [1, PropTypes.number, {}],
    }),

    selectors: ({ selectors }) => ({
      book: [() => [selectors.books, selectors.bookId], (books, bookId) => books[bookId], PropTypes.string],
    }),
  })

  const unmount = logic.mount()

  expect(logic.selectors.books()).toEqual(books)
  expect(logic.selectors.bookId()).toEqual(1)
  expect(logic.selectors.book()).toEqual(books[1])

  unmount()
})

test('selectors have the store and props as a default', () => {
  const books = {
    1: 'book1',
    2: 'book2',
  }

  const logic = kea({
    reducers: () => ({
      books: [books, {}],
      bookId: [1, {}],
    }),

    selectors: ({ selectors }) => ({
      book: [
        () => [selectors.books, selectors.bookId, (_, props) => props.extra],
        (books, bookId, extra) => books[bookId] + extra,
      ],
    }),
  })

  const logicWithProps = logic({ extra: 'nope' })

  const unmount = logicWithProps.mount()

  expect(logicWithProps.selectors.books()).toEqual(books)
  expect(logicWithProps.selectors.bookId()).toEqual(1)
  expect(logicWithProps.selectors.book()).toEqual('book1nope')

  unmount()
})

test('selectors run only once when input has not changed', () => {
  const books = {
    1: 'book1',
    2: 'book2',
  }

  let selectorRan = 0

  const logic = kea({
    reducers: ({ actions }) => ({
      books: [books, PropTypes.object, {}],
      bookId: [1, PropTypes.number, {}],
    }),

    selectors: ({ selectors }) => ({
      book: [
        () => [selectors.books, selectors.bookId],
        (books, bookId) => {
          selectorRan += 1
          return books[bookId]
        },
        PropTypes.string,
      ],
    }),
  })

  const unmount = logic.mount()

  expect(logic.selectors.books()).toEqual(books)
  expect(logic.selectors.bookId()).toEqual(1)
  expect(logic.selectors.book()).toEqual(books[1])

  expect(selectorRan).toEqual(1)

  expect(logic.selectors.book()).toEqual(books[1])
  expect(logic.selectors.book()).toEqual(books[1])

  expect(selectorRan).toEqual(1)

  unmount()
})
