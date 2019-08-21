import { createSelector } from 'reselect'
import { getStoreState } from '../../context'

export function createValues (logic, input) {
  if (Object.keys(logic.selectors).length === 0) {
    return
  }

  for (const key of Object.keys(logic.selectors)) {
    if (!logic.values.hasOwnProperty(key)) {
      Object.defineProperty(logic.values, key, {
        get: function () {
          return logic.selectors[key](getStoreState(), logic.props)
        },
        enumerable: true
      })
    }
  }
}
