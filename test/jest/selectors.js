/* global test, expect, beforeEach */
import { kea, resetContext } from '../../src'

describe('selectors', () => {
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
        books: [books, {}],
        bookId: [1, {}],
      }),

      selectors: ({ selectors }) => ({
        book: [() => [selectors.books, selectors.bookId], (books, bookId) => books[bookId]],
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

  test('inline props in selectors work after mounting', () => {
    // https://github.com/keajs/kea/issues/124
    // props passed to .build(props) were overridden by .mount(), which did behind the scenes .build({}).mount()
    const logic = kea({
      selectors: ({ props }) => ({
        valueFromSelectorsProps: [() => [], () => props.foo],
        valueFromInlineSelectorProps: [() => [(_, inlineProps) => inlineProps.foo], (foo) => foo],
      }),
    })

    logic.build({ foo: 'foo' })
    logic.mount()

    expect(logic.values.valueFromSelectorsProps).toEqual('foo')
    expect(logic.values.valueFromInlineSelectorProps).toEqual('foo')
  })

  test('selectors run only once when input has not changed', () => {
    const books = {
      1: 'book1',
      2: 'book2',
    }

    let selectorRan = 0

    const logic = kea({
      reducers: ({ actions }) => ({
        books: [books, {}],
        bookId: [1, {}],
      }),

      selectors: ({ selectors }) => ({
        book: [
          () => [selectors.books, selectors.bookId],
          (books, bookId) => {
            selectorRan += 1
            return books[bookId]
          },
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
})
