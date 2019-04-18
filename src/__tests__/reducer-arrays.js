/* global test, expect */
import { convertReducerArrays } from '../logic/reducers'
import PropTypes from 'prop-types'

test('it converts reducer arrays correctly', () => {
  const reducerFunction = state => state

  const convertedArrays = convertReducerArrays({
    everything: [0, PropTypes.number, { persist: true }, { ACTION: reducerFunction }],
    noProp: [0, { persist: true }, { ACTION: reducerFunction }],
    noOptions: [0, PropTypes.number, { ACTION: reducerFunction }],
    noPropNoOptions: [0, { ACTION: reducerFunction }]
  })

  expect(typeof convertedArrays.everything.reducer).toBe('function')
  expect(typeof convertedArrays.noProp.reducer).toBe('function')
  expect(typeof convertedArrays.noOptions.reducer).toBe('function')
  expect(typeof convertedArrays.noPropNoOptions.reducer).toBe('function')

  expect(convertedArrays).toEqual({
    everything: {
      options: { persist: true },
      reducer: convertedArrays.everything.reducer,
      type: PropTypes.number,
      value: 0
    },
    noProp: {
      options: { persist: true },
      reducer: convertedArrays.noProp.reducer,
      type: undefined,
      value: 0
    },
    noOptions: {
      reducer: convertedArrays.noOptions.reducer,
      type: PropTypes.number,
      value: 0
    },
    noPropNoOptions: {
      reducer: convertedArrays.noPropNoOptions.reducer,
      type: undefined,
      value: 0
    }
  })
})
