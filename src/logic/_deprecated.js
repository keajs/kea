import { createCombinedSaga as ccs } from '../scene/saga'
import { getRoutes as gr, combineScenesAndRoutes as csar } from '../scene/routes'
import { NEW_SCENE, createRootSaga as crs } from '../scene/store'
import Scene from '../scene/scene'

let gaveStructureWarning = false

// DEPRECATED
export function createMapping (reducer, value, type, options) {
  if (!gaveStructureWarning) {
    console.warn(`[KEA-LOGIC] createMapping is deprecated. Please use the new compact Array format. See here for an example: https://gist.github.com/mariusandra/1b8eeb3f2f4e542188b915e27133c858`)
    gaveStructureWarning = true
  }

  const mapping = {
    type,
    value,
    reducer
  }

  if (options) {
    Object.assign(mapping, options)
  }

  return mapping
}

let gaveCombinedSagaWarning = false

export function createCombinedSaga (sagas) {
  if (!gaveCombinedSagaWarning) {
    console.warn(`[KEA-LOGIC] createCombinedSaga moved from 'kea/logic' to 'kea/scene'.`)
    gaveCombinedSagaWarning = true
  }

  return ccs(sagas)
}

let gaveSceneWarning = false

export function createScene (args) {
  if (!gaveSceneWarning) {
    console.warn(`[KEA-LOGIC] createScene moved from 'kea/logic' to 'kea/scene'.`)
    gaveSceneWarning = true
  }

  return new Scene(args)
}

let gaveRoutesWarning = false

export function getRoutes (App, store, routes) {
  if (!gaveRoutesWarning) {
    console.warn(`[KEA-LOGIC] getRoutes moved from 'kea/logic' to 'kea/scene'.`)
    gaveRoutesWarning = true
  }
  return gr(App, store, routes)
}

let gaveCSARWarning = false

export function combineScenesAndRoutes (scenes, routes) {
  if (!gaveCSARWarning) {
    console.warn(`[KEA-LOGIC] combineScenesAndRoutes moved from 'kea/logic' to 'kea/scene'.`)
    gaveCSARWarning = true
  }
  return csar(scenes, routes)
}

let gaveCRSWarning = false

export function createRootSaga (appSagas = null) {
  if (!gaveCRSWarning) {
    console.warn(`[KEA-LOGIC] createRootSaga moved from 'kea/logic' to 'kea/scene'.`)
    gaveCRSWarning = true
  }
  return crs(appSagas)
}

export { NEW_SCENE }
