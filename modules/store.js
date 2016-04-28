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

// worker functions are loaded globally, reducers locally in store
var loadedWorkers = {};

function createRootSaga() {
  var appSagas = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

  return regeneratorRuntime.mark(function _callee() {
    var runningSaga, ranAppSagas, _ref, payload;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            runningSaga = null;
            ranAppSagas = false;

          case 2:
            if (!true) {
              _context.next = 20;
              break;
            }

            _context.next = 5;
            return (0, _effects.take)(NEW_SCENE);

          case 5:
            _ref = _context.sent;
            payload = _ref.payload;

            if (!(!ranAppSagas && appSagas)) {
              _context.next = 11;
              break;
            }

            _context.next = 10;
            return (0, _effects.call)(appSagas);

          case 10:
            ranAppSagas = true;

          case 11:
            if (!runningSaga) {
              _context.next = 14;
              break;
            }

            _context.next = 14;
            return (0, _effects.cancel)(runningSaga);

          case 14:
            if (!loadedWorkers[payload.name]) {
              _context.next = 18;
              break;
            }

            _context.next = 17;
            return (0, _effects.fork)(loadedWorkers[payload.name]);

          case 17:
            runningSaga = _context.sent;

          case 18:
            _context.next = 2;
            break;

          case 20:
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

  var rootReducer = createCombinedKeaReducer({}, appReducers);

  var store = finalCreateStore(rootReducer);

  store.loadedReducers = {};
  store.currentScene = null;

  store.addKeaScene = function (scene) {
    var name = scene.name;


    if (this.currentScene === name) {
      return;
    }

    this.loadedReducers[name] = scene.reducer;
    loadedWorkers[name] = scene.worker;

    this.replaceReducer(createCombinedKeaReducer(this.loadedReducers, appReducers));

    this.dispatch({
      type: NEW_SCENE,
      payload: {
        name: name
      }
    });

    this.currentScene = name;
  };

  return store;
}