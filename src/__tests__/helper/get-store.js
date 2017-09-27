import { resetKeaCache, keaReducer } from '../../index'
import { createStore, combineReducers } from 'redux'

export default function getStore () {
  resetKeaCache()

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const store = createStore(reducers)

  return { store }
}
