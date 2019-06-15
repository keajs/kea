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

  // TODO: should we rename connect.props to connect.selectors or something else?
  // react gets the result as props... but we have "props" to mean something else...
*/
export function createConnect (logic, input) {
  if (!input.connect) {
    return
  }

  const props = logic.props || {}
  const connect = typeof input.connect === 'function' ? input.connect(props) : input.connect

  if (connect.actions) {
    const response = deconstructMapping(connect.actions)

    response.forEach(([otherLogic, from, to]) => {
      if (otherLogic._isKea) {
        otherLogic = otherLogic(props)
      }
      if (otherLogic._isBuiltLogic) {
        addConnection(logic, otherLogic)
        logic.actions[to] = otherLogic.actions[from]
      } else {
        logic.actions[to] = otherLogic[from]
      }
    })
  }

  if (connect.props) {
    const response = deconstructMapping(connect.props)

    response.forEach(([otherLogic, from, to]) => {
      if (otherLogic._isKea) {
        otherLogic = otherLogic(props)
      }
      if (otherLogic._isBuiltLogic) {
        addConnection(logic, otherLogic)
        logic.selectors[to] = from === '*' ? otherLogic.selector : otherLogic.selectors[from]

        if (from !== '*' && typeof otherLogic.propTypes[from] !== 'undefined') {
          logic.propTypes[to] = otherLogic.propTypes[from]
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
