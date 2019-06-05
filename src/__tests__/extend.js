/* global test, expect, beforeEach */
import { kea } from '../index'
import './helper/jsdom'
import corePlugin from '../core'
import { activatePlugin } from '../plugins';
import { getContext, setContext, openContext, closeContext, resetContext, withContext } from '../context'

beforeEach(() => {
  resetContext()
})

test('can not extend after having been built', () => {
  const logic = kea({
    actions: () => ({
      doit: true
    })
  })

  expect(Object.keys(logic.actions).sort()).toEqual(['doit'])

  expect(() => {
    logic.extend({
      actions: () => ({
        domore: true
      })
    })
  }).toThrowError('[KEA] Can not extend logic once it has been built!')
})

// test('can extend actions', () => {
//   const logic = kea({
//     actions: () => ({
//       doit: true
//     })
//   })

//   expect(Object.keys(logic.actions).sort()).toEqual(['doit'])
// })

// test('can extend in plugins', () => {

// })
