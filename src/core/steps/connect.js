import { addConnection } from '../shared/connect'

/*
  Copy the connect'ed logic stores' selectors and actions into this object

  input.connect = {
    props: [farmSceneLogic, ['chicken']],
    actions: [farmSceneLogic, ['setChicken']]
  }

  ... converts to:

  logic.connections = { 'scenes.farm': farmSceneLogic }
  logic.actions = { setChicken: (id) => ({ type: 'set chicken (farm)', payload: { id } } }) }
  logic.selectors = { chicken: (state) => state.scenes.farm }

  // TODO: should we rename connect.props to connect.selectors ?
*/
export function createConnect (logic, input) {
  if (!input.connect) {
    return
  }

  if (input.connect.actions) {
    const response = deconstructMapping(input.connect.actions)

    response.forEach(([otherLogic, from, to]) => {
      if (otherLogic._isKea || otherLogic._isKeaBuildWithProps) {
        let logicToConenct = otherLogic._isKeaBuildWithProps ? otherLogic(logic.props) : otherLogic
        if (logicToConenct.build && !logicToConenct.isBuilt()) {
          logicToConenct = logicToConenct.build()
        }
        addConnection(logic, logicToConenct)
        logic.actions[to] = logicToConenct.actions[from]
      } else {
        logic.actions[to] = otherLogic[from]
      }
    })
  }

  if (input.connect.props) {
    const response = deconstructMapping(input.connect.props)

    response.forEach(([otherLogic, from, to]) => {
      if (otherLogic._isKea || otherLogic._isKeaBuildWithProps) {
        let logicToConenct = otherLogic._isKeaBuildWithProps ? otherLogic(logic.props) : otherLogic
        if (logicToConenct.build && !logicToConenct.isBuilt()) {
          logicToConenct = logicToConenct.build()
        }
        addConnection(logic, logicToConenct)
        logic.selectors[to] = from === '*' ? logicToConenct.selector : logicToConenct.selectors[from]

        if (from !== '*' && typeof logicToConenct.propTypes[from] !== 'undefined') {
          logic.propTypes[to] = logicToConenct.propTypes[from]
        }
      } else {
        logic.selectors[to] = from === '*' ? otherLogic : (state, props) => otherLogic(state, props)[from]
      }
    })
  }
}

// input: [ logic1, [ 'a', 'b as c' ], logic2, [ 'c', 'd' ] ]
// logic: [ [logic1, 'a', 'a'], [logic1, 'b', 'c'], [logic2, 'c', 'c'], [logic2, 'd', 'd'] ]
export function deconstructMapping (mapping) {
  if (mapping.length % 2 === 1) {
    console.error(`[KEA] uneven mapping given to connect:`, mapping)
    console.trace()
    return null
  }

  let response = []

  for (let i = 0; i < mapping.length; i += 2) {
    const logic = mapping[i]
    const array = mapping[i + 1]

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
