/* global test, expect, beforeEach */
import { kea, resetContext, getContext } from '../index'

beforeEach(() => {
  resetContext({ createStore: true })
})

test('logic.values reflects the current state', () => {
  const books = {
    1: 'book1',
    2: 'book2'
  }
  
  const logic = kea({
    reducers: () => ({
      books: [books, {}],
      bookId: [1, {}]
    }),

    selectors: ({ selectors }) => ({
      book: [
        () => [selectors.books, selectors.bookId, (_, props) => props.extra],
        (books, bookId, extra) => books[bookId] + extra
      ]
    })
  })

  const builtLogic = logic({ extra: 'nope' })
  const unmount = builtLogic.mount()

  expect(builtLogic.values.books).toEqual(books)
  expect(builtLogic.values.bookId).toEqual(1)
  expect(builtLogic.values.book).toEqual('book1nope')

  unmount()
})
