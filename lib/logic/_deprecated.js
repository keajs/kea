'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NEW_SCENE = undefined;
exports.createMapping = createMapping;
exports.createCombinedSaga = createCombinedSaga;
exports.createScene = createScene;
exports.getRoutes = getRoutes;
exports.combineScenesAndRoutes = combineScenesAndRoutes;
exports.createRootSaga = createRootSaga;
exports.createKeaStore = createKeaStore;

var _saga = require('../scene/saga');

var _routes = require('../scene/routes');

var _store = require('../scene/store');

var _scene = require('../scene/scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var gaveStructureWarning = false;

// DEPRECATED
function createMapping(reducer, value, type, options) {
  if (!gaveStructureWarning) {
    console.warn('[KEA-LOGIC] createMapping is deprecated. Please use the new compact Array format. See here for an example: https://gist.github.com/mariusandra/1b8eeb3f2f4e542188b915e27133c858');
    gaveStructureWarning = true;
  }

  var mapping = {
    type: type,
    value: value,
    reducer: reducer
  };

  if (options) {
    Object.assign(mapping, options);
  }

  return mapping;
}

var gaveCombinedSagaWarning = false;

function createCombinedSaga(sagas) {
  if (!gaveCombinedSagaWarning) {
    console.warn('[KEA-LOGIC] createCombinedSaga moved from \'kea/logic\' to \'kea/scene\'.');
    gaveCombinedSagaWarning = true;
  }

  return (0, _saga.createCombinedSaga)(sagas);
}

var gaveSceneWarning = false;

function createScene(args) {
  if (!gaveSceneWarning) {
    console.warn('[KEA-LOGIC] createScene moved from \'kea/logic\' to \'kea/scene\'.');
    gaveSceneWarning = true;
  }

  return new _scene2.default(args);
}

var gaveRoutesWarning = false;

function getRoutes(App, store, routes) {
  if (!gaveRoutesWarning) {
    console.warn('[KEA-LOGIC] getRoutes moved from \'kea/logic\' to \'kea/scene\'.');
    gaveRoutesWarning = true;
  }
  return (0, _routes.getRoutes)(App, store, routes);
}

var gaveCSARWarning = false;

function combineScenesAndRoutes(scenes, routes) {
  if (!gaveCSARWarning) {
    console.warn('[KEA-LOGIC] combineScenesAndRoutes moved from \'kea/logic\' to \'kea/scene\'.');
    gaveCSARWarning = true;
  }
  return (0, _routes.combineScenesAndRoutes)(scenes, routes);
}

var gaveCRSWarning = false;

function createRootSaga() {
  var appSagas = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  if (!gaveCRSWarning) {
    console.warn('[KEA-LOGIC] createRootSaga moved from \'kea/logic\' to \'kea/scene\'.');
    gaveCRSWarning = true;
  }
  return (0, _store.createRootSaga)(appSagas);
}

var gaveCreateKSWarning = false;

function createKeaStore(finalCreateStore) {
  var appReducers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!gaveCreateKSWarning) {
    console.warn('[KEA-LOGIC] createKeaStore moved from \'kea/logic\' to \'kea/scene\'.');
    gaveCreateKSWarning = true;
  }
  return (0, _store.createKeaStore)(finalCreateStore, appReducers);
}

exports.NEW_SCENE = _store.NEW_SCENE;