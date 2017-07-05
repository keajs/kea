import { addKeaScene } from './store'

function lazyLoad (store, lazyLoadableModule) {
  return (location, cb) => {
    lazyLoadableModule(module => {
      const scene = module.default
      addKeaScene(scene, false, store)
      cb(null, scene.component)
    })
  }
}

export function getRoutes (App, store, routes) {
  return {
    component: App,
    childRoutes: Object.keys(routes).map(route => ({
      path: route,
      getComponent: lazyLoad(store, routes[route])
    }))
  }
}

export function combineScenesAndRoutes (scenes, routes) {
  let combined = {}

  Object.keys(routes).forEach(route => {
    if (scenes[routes[route]]) {
      combined[route] = scenes[routes[route]]
    } else {
      console.error(`[KEA-LOGIC] scene ${routes[route]} not found in scenes object (route: ${route})`)
    }
  })

  return combined
}
