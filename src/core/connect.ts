import { BuiltLogic, Logic, LogicBuilder, LogicWrapper, Selector } from '../types'
import { isBuiltLogic, isLogicWrapper } from '../utils'
import { getContext } from '../kea/context'
import { createActionType } from './actions'

/*
  Copy the connect'ed logic stores' selectors and actions into this object

  input.connect = {
    logic: [farmSceneLogic],
    values: [farmSceneLogic, ['chicken']],
    actions: [farmSceneLogic, ['setChicken']]
  }

  ... converts to:

  logic.connections = { 'scenes.farm': farmSceneLogic }
  logic.actions = { setChicken: (id) => void }
  logic.selectors = { chicken: (state) => state.scenes.farm }
*/
export function connect<L extends Logic = Logic>(input: any | ((props: L['props']) => any)): LogicBuilder<L> {
  return (logic) => {
    const props = logic.props || {}
    const connect = typeof input === 'function' ? input(props) : input

    const connectLogic = Array.isArray(connect) ? connect : connect.logic

    if (connectLogic) {
      for (let otherLogic of connectLogic) {
        if (otherLogic._isKea) {
          otherLogic = otherLogic(props)
        }
        addConnection(logic, otherLogic)
      }
      if (Array.isArray(connect)) {
        return
      }
    }

    if (connect.actions) {
      const response = deconstructMapping(connect.actions)

      for (let [otherLogic, from, to] of response) {
        if (process.env.NODE_ENV !== 'production') {
          if (typeof otherLogic !== 'function' && typeof otherLogic !== 'object') {
            throw new Error(
              `[KEA] Logic "${logic.pathString}" can not connect to ${typeof otherLogic} to request action "${from}"`,
            )
          }
        }
        if (isLogicWrapper(otherLogic)) {
          otherLogic = otherLogic.build(props)
        }
        if (isBuiltLogic(otherLogic)) {
          addConnection(logic, otherLogic)
          if (getContext().buildHeap.includes(otherLogic)) {
            // circular build (otherLogic -> logic -> otherLogic)
            logic.actionCreators[to] = (...args: any[]) => (otherLogic as BuiltLogic).actionCreators[from](...args)
            logic.actionCreators[to].toString = () => createActionType(from, (otherLogic as BuiltLogic).pathString)
          } else {
            logic.actionCreators[to] = otherLogic.actionCreators[from]
          }
        } else {
          logic.actionCreators[to] = (otherLogic as Record<string, any>)[from]
        }

        if (process.env.NODE_ENV !== 'production') {
          if (typeof logic.actionCreators[to] === 'undefined') {
            throw new Error(`[KEA] Logic "${logic.pathString}", connecting to action "${from}" returns 'undefined'`)
          }
        }
      }
    }

    if (connect.values || connect.props) {
      const response = deconstructMapping(connect.values || connect.props)

      for (let [otherLogic, from, to] of response) {
        if (process.env.NODE_ENV !== 'production') {
          if (typeof otherLogic !== 'function' && typeof otherLogic !== 'object') {
            throw new Error(
              `[KEA] Logic "${logic.pathString}" can not connect to ${typeof otherLogic} to request prop "${from}"`,
            )
          }
        }

        if (isLogicWrapper(otherLogic)) {
          otherLogic = otherLogic(props)
        }
        if (isBuiltLogic(otherLogic)) {
          addConnection(logic, otherLogic)
          let selector = from === '*' ? otherLogic.selector : otherLogic.selectors[from]
          const throwError = () => {
            throw new Error(`Connected selector "${to}" on logic "${logic.pathString}" is undefined.`)
          }
          if (selector) {
            logic.selectors[to] = selector
          } else if (getContext().buildHeap.includes(otherLogic)) {
            // circular build (otherLogic -> logic -> otherLogic)
            logic.selectors[to] = (state, props) =>
              (otherLogic as BuiltLogic).selectors[from]
                ? (otherLogic as BuiltLogic).selectors[from](state, props)
                : throwError()
          } else {
            throwError()
          }
        } else if (typeof otherLogic === 'function') {
          logic.selectors[to] = (
            from === '*'
              ? otherLogic
              : (state, props) => {
                  const values = (otherLogic as Selector)(state, props)
                  return values && values[from]
                }
          ) as Selector
        }
      }
    }
  }
}

type LogicMapping = (Logic | BuiltLogic | LogicWrapper | Selector | Record<string, any> | string[])[]
type DeconstructedLogicMapping = [Logic | BuiltLogic | LogicWrapper | Selector | Record<string, any>, string, string][]

// input: [ logic1, [ 'a', 'b as c' ], logic2, [ 'c', 'd' ] ]
// logic: [ [logic1, 'a', 'a'], [logic1, 'b', 'c'], [logic2, 'c', 'c'], [logic2, 'd', 'd'] ]
function deconstructMapping(mapping: LogicMapping): DeconstructedLogicMapping {
  if (mapping.length % 2 === 1) {
    console.error(mapping)
    throw new Error(`[KEA] Uneven mapping given to connect`)
  }

  const response: DeconstructedLogicMapping = []

  for (let i = 0; i < mapping.length; i += 2) {
    const logic = mapping[i]
    const array = mapping[i + 1]

    if (!Array.isArray(array)) {
      console.error(mapping)
      throw new Error('[KEA] Invalid mapping given to connect. Make sure every second element is an array!')
    }

    for (let j = 0; j < array.length; j++) {
      if (array[j].includes(' as ')) {
        const parts = array[j].split(' as ')
        response.push([logic, parts[0], parts[1]])
      } else {
        response.push([logic, array[j], array[j]])
      }
    }
  }

  return response
}

export function addConnection(logic: Logic, otherLogic: Logic): void {
  if (!otherLogic.connections || Object.keys(otherLogic.connections).length === 0) {
    return
  }

  // already connected to all, skip checking everything individually
  if (logic.connections[otherLogic.pathString]) {
    return
  }

  Object.keys(otherLogic.connections).forEach((path) => {
    if (!logic.connections[path]) {
      logic.connections[path] = otherLogic.connections[path]
    }
  })
}
