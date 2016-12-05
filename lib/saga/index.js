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
  }

  _createClass(Saga, [{
    key: 'init',
    value: function init() {
      var object = {};
      object.actions = (0, _logic.selectActionsFromLogic)(this.actions(object));
      Object.assign(this, object);

      var _this = this;

      return regeneratorRuntime.mark(function _callee() {
        var ops, opKeys, k, op, list, keys, i, fn, j;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log(this, _this, object);
                // run the run function

                if (!_this.run) {
                  _context.next = 4;
                  break;
                }

                _context.next = 4;
                return (0, _effects.spawn)(_this.run.bind(_this));

              case 4:

                // run takeEvery and takeLatest
                ops = { takeEvery: _reduxSaga.takeEvery, takeLatest: _reduxSaga.takeLatest };
                opKeys = Object.keys(ops);
                k = 0;

              case 7:
                if (!(k < opKeys.length)) {
                  _context.next = 33;
                  break;
                }

                op = opKeys[k];

                if (!_this[op]) {
                  _context.next = 30;
                  break;
                }

                list = _this[op](object);
                keys = Object.keys(list);
                i = 0;

              case 13:
                if (!(i < keys.length)) {
                  _context.next = 30;
                  break;
                }

                fn = list[keys[i]];

                if (!Array.isArray(fn)) {
                  _context.next = 25;
                  break;
                }

                j = 0;

              case 17:
                if (!(j < fn.length)) {
                  _context.next = 23;
                  break;
                }

                _context.next = 20;
                return ops[op](keys[i], fn[j].bind(_this));

              case 20:
                j++;
                _context.next = 17;
                break;

              case 23:
                _context.next = 27;
                break;

              case 25:
                _context.next = 27;
                return ops[op](keys[i], fn.bind(_this));

              case 27:
                i++;
                _context.next = 13;
                break;

              case 30:
                k++;
                _context.next = 7;
                break;

              case 33:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      });
    }
  }]);

  return Saga;
}();

exports.default = Saga;