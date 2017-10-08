// input: [ logic1, [ 'a', 'b as c' ], logic2, [ 'c', 'd' ] ]
// output: [ [logic1, 'a', 'a'], [logic1, 'b', 'c'], [logic2, 'c', 'c'], [logic2, 'd', 'd'] ]

import { addReducer } from '../reducer'

function connectLogicIfUnconnected (logic) {
  if (logic._isKeaSingleton && !logic._keaReducerConnected && logic.reducer) {
    addReducer(logic.path, logic.reducer, true)
    logic._keaReducerConnected = true
  }
}

export function deconstructMapping (mapping) {
  if (mapping.length % 2 === 1) {
    console.error(`[KEA-LOGIC] uneven mapping given to connect:`, mapping)
    console.trace()
    return null
  }

  let response = []

  for (let i = 0; i < mapping.length; i += 2) {
    const logic = mapping[i]
    const array = mapping[i + 1]

    connectLogicIfUnconnected(logic)

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
