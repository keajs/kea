'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createKeaStore = exports.createRootSaga = exports.NEW_SCENE = exports.combineScenesAndRoutes = exports.getRoutes = exports.createCombinedSaga = undefined;

var _saga = require('./saga');

Object.defineProperty(exports, 'createCombinedSaga', {
  enumerable: true,
  get: function get() {
    return _saga.createCombinedSaga;
  }
});

var _routes = require('./routes');

Object.defineProperty(exports, 'getRoutes', {
  enumerable: true,
  get: function get() {
    return _routes.getRoutes;
  }
});
Object.defineProperty(exports, 'combineScenesAndRoutes', {
  enumerable: true,
  get: function get() {
    return _routes.combineScenesAndRoutes;
  }
});

var _store = require('./store');

Object.defineProperty(exports, 'NEW_SCENE', {
  enumerable: true,
  get: function get() {
    return _store.NEW_SCENE;
  }
});
Object.defineProperty(exports, 'createRootSaga', {
  enumerable: true,
  get: function get() {
    return _store.createRootSaga;
  }
});
Object.defineProperty(exports, 'createKeaStore', {
  enumerable: true,
  get: function get() {
    return _store.createKeaStore;
  }
});
exports.createScene = createScene;

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createScene(args) {
  return new _scene2.default(args);
}