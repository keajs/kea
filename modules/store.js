'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NEW_SCENE = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.createRootSaga = createRootSaga;
exports.createKeaStore = createKeaStore;

var _effects = require('redux-saga/effects');

var _redux = require('redux');

var NEW_SCENE = exports.NEW_SCENE = '@@kea/NEW_SCENE';

// worker functions are loaded globally, reducers locally in store
var loadedWorkers = {};

function createRootSaga() {
  var appSagas = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

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
  var appReducers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var rootReducer = createCombinedKeaReducer({}, appReducers);

  var store = finalCreateStore(rootReducer);

  store.loadedScenes = {}; // all loaded scenes
  store.loadedReducers = {};
  store.currentScene = null;

  // create a function that will load all new reducers
  store.addKeaScene = function (scene) {
    var _this = this;

    if (!scene) {
      return;
    }

    var name = scene.name;


    if (this.currentScene === name) {
      return;
    }

    if (!this.loadedScenes[name]) {
      (function () {
        // store the scene and saga
        loadedWorkers[name] = scene.worker;
        _this.loadedScenes[name] = scene;

        // go through all loaded scenes and recreate the reducers
        // this is so because scenes can load logic from other scenes
        Object.keys(_this.loadedScenes).forEach(function (key) {
          var logic = _this.loadedScenes[key].logic;


          logic.forEach(function (logicClass) {
            var path = logicClass.path;


            if (path.length !== 3 || path[0] !== 'scenes') {
              console.error('[KEA-LOGIC] logic class in scene "' + key + '" does not follow the path structure ["scenes", "sceneName", "logicName"]:', path);
              return;
            }

            if (!logicClass.reducer) {
              console.error('[KEA-LOGIC] No reducer in logic!', logicClass.path, logicClass);
              console.trace();
              return;
            }

            var _path = _slicedToArray(path, 3),
                sceneName = _path[1],
                logicName = _path[2];

            if (!_this.loadedReducers[sceneName]) {
              _this.loadedReducers[sceneName] = {};
            }

            if (!_this.loadedReducers[sceneName][logicName]) {
              _this.loadedReducers[sceneName][logicName] = logicClass.reducer;
            }
          });
        });

        var combinedReducers = {};

        Object.keys(_this.loadedReducers).forEach(function (sceneName) {
          combinedReducers[sceneName] = (0, _redux.combineReducers)(_this.loadedReducers[sceneName]);
        });

        _this.replaceReducer(createCombinedKeaReducer(combinedReducers, appReducers));
      })();
    }

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