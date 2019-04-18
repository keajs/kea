import { connect } from 'react-redux'

import { convertInputToLogic, convertPartialDynamicInput, clearLogicCache } from '../logic/index'

export function kea (input) {
  const wrapper = connect(
    mapStateToPropsCreator(input),
    mapDispatchToPropsCreator(input)
  )

  wrapper._isKeaFunction = true
  wrapper._isKeaSingleton = !input.key

  if (!input.key) {
    Object.assign(wrapper, convertInputToLogic({ input }))
  } else {
    Object.assign(wrapper, convertPartialDynamicInput(input))
    wrapper.withKey = (key) => convertInputToLogic({ input, key })
  }

  return wrapper
}

const mapStateToPropsCreator = input => (state, ownProps) => {
  const createdLogicEverything = convertInputToLogic({ input, props: ownProps })

  let resp = {}
  Object.entries(createdLogicEverything.selectors).forEach(([key, selector]) => {
    resp[key] = selector(state, ownProps)
  })

  return resp
}

const mapDispatchToPropsCreator = input => (dispatch, ownProps) => {
  const createdLogicEverything = convertInputToLogic({ input, props: ownProps })

  let actions = {}
  Object.entries(createdLogicEverything.actions).forEach(([key, action]) => {
    actions[key] = (...args) => dispatch(action(...args))
  })

  return {
    dispatch: dispatch,
    actions: actions
  }
}

export function resetKeaLogicCache () {
  clearLogicCache()
}
