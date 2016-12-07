'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reduxSaga = require('redux-saga');

var _effects = require('redux-saga/effects');

var _logic = require('../logic');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Saga = function () {
  function Saga() {
    _classCallCheck(this, Saga);

    this._saga = null;
  }

  _createClass(Saga, [{
    key: 'init',
    value: function init() {
      // no need to re-create the function
      if (this._saga) {
        return this._saga;
      }

      // bind all functions to this
      var keys = Object.keys(this);
      for (var i = 0; i < keys.length; i++) {
        if (typeof this[keys[i]] === 'function') {
          this[keys[i]] = this[keys[i]].bind(this);
        }
      }

      // create actions object
      var object = {};
      object.actions = this.actions ? (0, _logic.selectActionsFromLogic)(this.actions(object)) : {};
      Object.assign(this, object);

      var _this = this;

      // generate the saga
      this._saga = regeneratorRuntime.mark(function _callee() {
        var ops, opKeys, k, op, list, _keys, _i, fn, j;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;

                // start takeEvery and takeLatest watchers
                ops = { takeEvery: _reduxSaga.takeEvery, takeLatest: _reduxSaga.takeLatest };
                opKeys = Object.keys(ops);
                k = 0;

              case 4:
                if (!(k < opKeys.length)) {
                  _context.next = 30;
                  break;
                }

                op = opKeys[k];

                if (!_this[op]) {
                  _context.next = 27;
                  break;
                }

                list = _this[op](object);
                _keys = Object.keys(list);
                _i = 0;

              case 10:
                if (!(_i < _keys.length)) {
                  _context.next = 27;
                  break;
                }

                fn = list[_keys[_i]];

                if (!Array.isArray(fn)) {
                  _context.next = 22;
                  break;
                }

                j = 0;

              case 14:
                if (!(j < fn.length)) {
                  _context.next = 20;
                  break;
                }

                _context.next = 17;
                return ops[op](_keys[_i], fn[j]);

              case 17:
                j++;
                _context.next = 14;
                break;

              case 20:
                _context.next = 24;
                break;

              case 22:
                _context.next = 24;
                return ops[op](_keys[_i], fn);

              case 24:
                _i++;
                _context.next = 10;
                break;

              case 27:
                k++;
                _context.next = 4;
                break;

              case 30:
                if (!_this.run) {
                  _context.next = 33;
                  break;
                }

                _context.next = 33;
                return (0, _effects.call)(_this.run);

              case 33:
                _context.prev = 33;
                _context.next = 36;
                return (0, _effects.cancelled)();

              case 36:
                if (!_context.sent) {
                  _context.next = 40;
                  break;
                }

                if (!_this.cancelled) {
                  _context.next = 40;
                  break;
                }

                _context.next = 40;
                return (0, _effects.call)(_this.cancelled);

              case 40:
                return _context.finish(33);

              case 41:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0,, 33, 41]]);
      });

      return this._saga;
    }
  }]);

  return Saga;
}();

Saga._isKeaSagaClass = true;

exports.default = Saga;