'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createScene = createScene;

var _saga = require('./saga');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KeaScene = function KeaScene(_ref) {
  var name = _ref.name;
  var logic = _ref.logic;
  var sagas = _ref.sagas;
  var component = _ref.component;

  _classCallCheck(this, KeaScene);

  this.name = name;
  this.logic = logic || [];
  this.sagas = sagas || [];
  this.component = component;

  if (this.sagas) {
    this.worker = (0, _saga.createCombinedSaga)(this.sagas);
  }
};

function createScene(args) {
  return new KeaScene(args);
}