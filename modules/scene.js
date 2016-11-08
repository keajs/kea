'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createScene = createScene;

var _redux = require('redux');

var _saga = require('./saga');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KeaScene = function () {
  function KeaScene(_ref) {
    var name = _ref.name,
        logic = _ref.logic,
        sagas = _ref.sagas,
        component = _ref.component;

    _classCallCheck(this, KeaScene);

    this.name = name;
    this.logic = logic || [];
    this.sagas = sagas || [];
    this.component = component;

    if (this.sagas) {
      this.worker = (0, _saga.createCombinedSaga)(this.sagas);
      this.saga = this.worker;
    }
  }

  _createClass(KeaScene, [{
    key: 'combineReducers',
    value: function combineReducers() {
      var sceneReducers = {};
      this.logic.forEach(function (logic) {
        sceneReducers[logic.path[logic.path.length - 1]] = logic.reducer;
      });
      return (0, _redux.combineReducers)(sceneReducers);
    }
  }]);

  return KeaScene;
}();

function createScene(args) {
  return new KeaScene(args);
}