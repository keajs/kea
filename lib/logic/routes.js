"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRoutes = getRoutes;
exports.combineScenesAndRoutes = combineScenesAndRoutes;
function lazyLoad(store, lazyLoadableModule) {
  return function (location, cb) {
    lazyLoadableModule(function (module) {
      var scene = module.default;
      store.addKeaScene(scene);
      cb(null, scene.component);
    });
  };
}

function getRoutes(App, store, routes) {
  return {
    component: App,
    childRoutes: Object.keys(routes).map(function (route) {
      return {
        path: route,
        getComponent: lazyLoad(store, routes[route])
      };
    })
  };
}

function combineScenesAndRoutes(scenes, routes) {
  var combined = {};

  Object.keys(routes).forEach(function (route) {
    if (scenes[routes[route]]) {
      combined[route] = scenes[routes[route]];
    } else {
      console.error("[KEA-LOGIC] scene " + routes[route] + " not found in scenes object (route: " + route + ")");
    }
  });

  return combined;
}