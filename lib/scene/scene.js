'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _redux = require('redux');

var _saga = require('./saga');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Scene = function () {
  function Scene(_ref) {
    var name = _ref.name,
        logic = _ref.logic,
        sagas = _ref.sagas,
        component = _ref.component;

    _classCallCheck(this, Scene);

    this.name = name;
    this.logic = logic || [];
    this.sagas = sagas ? sagas.map(function (Saga) {
      return Saga._isKeaSagaClass ? new Saga().init() : Saga;
    }) : [];
    this.component = component;

    if (this.sagas) {
      this.worker = (0, _saga.createCombinedSaga)(this.sagas);
      this.saga = this.worker;
    }
  }

  _createClass(Scene, [{
    key: 'combineReducers',
    value: function combineReducers() {
      var sceneReducers = {};
      this.logic.forEach(function (logic) {
        sceneReducers[logic.path[logic.path.length - 1]] = logic.reducer;
      });
      return (0, _redux.combineReducers)(sceneReducers);
    }
  }]);

  return Scene;
}();

Scene._isKeaSceneClass = true;

exports.default = Scene;