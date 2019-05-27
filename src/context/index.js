let currentContext

/*
  currentContext = {
    meta: {
      plugins: {
        activated: [],
        logicSteps: {},
        logicKeys: {}
      },

      defaultReducerRoot: null,
      reducerTree: {},
      rootReducers: {},

      mountPathCounter: {},
      mountedLogic: {},

      inputPathCreators: new WeakMap(),
      inlineCounter: 0,

      store: undefined
    },

    context: {
      logic: {
        "scenes.something,index": {
          ...
        }
      }
    }
  }

*/

export function openContext (previousContext = {}) {
  currentContext = {
    meta: {},
    context: Object.assign({}, previousContext)
  }
}

export function closeContext () {
  currentContext = undefined
} 

export function withContext (code, previousContext = {}) {
  openContext(previousContext)
  const returnValue = code()
  closeContext()

  return {
    context: currentContext.context,
    returnValue
  }
}

export function getCurrentContext () {
  return currentContext
}