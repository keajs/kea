export default function getConnectedSagas (mapping) {
  let sagas = []
  let uniqueSagaKeys = {}

  const props = mapping.props || []
  for (let i = 0; i < props.length; i += 2) {
    const logic = props[i]
    if (logic && logic._keaPlugins && logic._keaPlugins.saga && logic.path) {
      const sagaPath = logic.path.join('.')
      if (!uniqueSagaKeys[sagaPath]) {
        sagas.push(logic.saga)
        uniqueSagaKeys[sagaPath] = true
      }
    }
  }

  const actions = mapping.actions || []
  for (let i = 0; i < actions.length; i += 2) {
    const logic = actions[i]
    if (logic && logic._keaPlugins && logic._keaPlugins.saga && logic.path) {
      const sagaPath = logic.path.join('.')
      if (!uniqueSagaKeys[sagaPath]) {
        sagas.push(logic.saga)
        uniqueSagaKeys[sagaPath] = true
      }
    }
  }

  return sagas
}
