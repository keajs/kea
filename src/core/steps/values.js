import { createSelector } from 'reselect'
import { getContext } from '../../context'

const getStoreState = () => getContext().store.getState()

export function createValues (logic, input) {
  if (Object.keys(logic.selectors).length === 0) {
    return
  }

  for (const key of Object.keys(logic.selectors)) {
    if (!logic.values.hasOwnProperty(key)) {
      Object.defineProperty(logic.values, key, {
        get: function () {
          return logic.selectors[key](getStoreState(), logic.props)
        }
      })
    }
  }
}
