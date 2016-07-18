'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCombinedSaga = createCombinedSaga;

var _effects = require('redux-saga/effects');

function createCombinedSaga(sagas) {
  return regeneratorRuntime.mark(function _callee() {
    var workers, i, worker, _i;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            workers = [];
            _context.prev = 1;
            i = 0;

          case 3:
            if (!(i < sagas.length)) {
              _context.next = 11;
              break;
            }

            _context.next = 6;
            return (0, _effects.fork)(sagas[i]);

          case 6:
            worker = _context.sent;

            workers.push(worker);

          case 8:
            i++;
            _context.next = 3;
            break;

          case 11:
            if (!true) {
              _context.next = 16;
              break;
            }

            _context.next = 14;
            return (0, _effects.take)('wait until worker cancellation');

          case 14:
            _context.next = 11;
            break;

          case 16:
            _context.prev = 16;
            _context.next = 19;
            return (0, _effects.cancelled)();

          case 19:
            if (!_context.sent) {
              _context.next = 27;
              break;
            }

            _i = 0;

          case 21:
            if (!(_i < workers.length)) {
              _context.next = 27;
              break;
            }

            _context.next = 24;
            return (0, _effects.cancel)(workers[_i]);

          case 24:
            _i++;
            _context.next = 21;
            break;

          case 27:
            return _context.finish(16);

          case 28:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[1,, 16, 28]]);
  });
}