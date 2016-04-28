'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NEW_SCENE = undefined;
exports.createRootSaga = createRootSaga;
exports.createKeaStore = createKeaStore;

var _effects = require('redux-saga/effects');

var _redux = require('redux');

var NEW_SCENE = exports.NEW_SCENE = '@@kea/NEW_SCENE';

var loadedReducers = {};
var loadedWorkers = {};
var currentScene = null;

function createRootSaga() {
  var appSagas = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

  return regeneratorRuntime.mark(function _callee() {
    var runningSaga, _ref, payload;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            runningSaga = null;

            if (!appSagas) {
              _context.next = 4;
              break;
            }

            _context.next = 4;
            return (0, _effects.call)(appSagas);

          case 4:
            if (!true) {
              _context.next = 18;
              break;
            }

            _context.next = 7;
            return (0, _effects.take)(NEW_SCENE);

          case 7:
            _ref = _context.sent;
            payload = _ref.payload;

            if (!runningSaga) {
              _context.next = 12;
              break;
            }

            _context.next = 12;
            return (0, _effects.cancel)(runningSaga);

          case 12:
            if (!loadedWorkers[payload.name]) {
              _context.next = 16;
              break;
            }

            _context.next = 15;
            return (0, _effects.fork)(loadedWorkers[payload.name]);

          case 15:
            runningSaga = _context.sent;

          case 16:
            _context.next = 4;
            break;

          case 18:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  });
}

function createCombinedKeaReducer(sceneReducers, appReducers) {
  var hasScenes = sceneReducers && Object.keys(sceneReducers).length > 0;

  return (0, _redux.combineReducers)(Object.assign({}, appReducers, {
    scenes: hasScenes ? (0, _redux.combineReducers)(sceneReducers) : function () {
      return {};
    }
  }));
}

function createKeaStore(finalCreateStore) {
  var appReducers = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var rootReducer = createCombinedKeaReducer(loadedReducers, appReducers);

  var store = finalCreateStore(rootReducer);

  store.clearKeaScene = function () {
    loadedReducers = {};
    loadedWorkers = {};
    currentScene = null;
  };

  store.addKeaScene = function (scene) {
    var name = scene.name;


    if (currentScene === name) {
      return;
    }

    loadedReducers[name] = scene.reducer;
    loadedWorkers[name] = scene.worker;
    this.replaceReducer(createCombinedKeaReducer(loadedReducers, appReducers));

    this.dispatch({
      type: NEW_SCENE,
      payload: {
        name: name
      }
    });

    currentScene = name;
  };

  return store;
}