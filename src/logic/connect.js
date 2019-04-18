export function createConnect (input, output) {
  if (!input.connect) {
    return
  }

  if (input.connect.actions) {
    const response = deconstructMapping(input.connect.actions)

    response.forEach(([logic, from, to]) => {
      output.actions[to] = logic.actions[from]
    })
  }

  if (input.connect.props) {
    const response = deconstructMapping(input.connect.props)

    response.forEach(([logic, from, to]) => {
      if (from === '*') {
        output.selectors[to] = logic.selector
      } else {
        output.selectors[to] = logic.selectors[from]
      }
    })
  }
}

// input: [ logic1, [ 'a', 'b as c' ], logic2, [ 'c', 'd' ] ]
// output: [ [logic1, 'a', 'a'], [logic1, 'b', 'c'], [logic2, 'c', 'c'], [logic2, 'd', 'd'] ]
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
