import { resetKeaCache, keaSaga, keaReducer } from '../../index'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'

export default function getStore () {
  resetKeaCache()

  const reducers = combineReducers({
    scenes: keaReducer('scenes')
  })

  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)

  const store = finalCreateStore(reducers)

  sagaMiddleware.run(keaSaga)

  return { store, sagaMiddleware }
}
