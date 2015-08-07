+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var Pin = scope.Pin,
    Module = scope.Module,
    proto;

  function Max7219(board, din, cs, clk) {
    Module.call(this);
    this._board = board;
    this._din = din;
    this._cs = cs;
    this._clk = clk;
    this._intensity = 0;
    this._data = 'ffffffffffffffff';
    this._board.send([0xf0, 4, 8, 0, din.number, cs.number, clk.number, 0xf7]);
  }

  Max7219.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: Max7219
    },
    intensity: {
      get: function () {
        return this._intensity;
      },
      set: function (val) {
        if (arguments.length == 1) {
          if (val >= 0 && val <= 15) {
            this._board.send([0xf0, 4, 8, 3, val, 0xf7]);
            this._intensity = val;
          }
        }
        return this._intensity;
      }
    }
  });

  proto.on = function (data) {
    if (arguments.length == 1) {
      this._data = data;
    }
    var sendData = [0xf0, 4, 8, 1];
    for (var i = 0; i < this._data.length; i = i + 2) {
      var hex = '0x' + this._data.substring(i, i + 2);
      sendData.push(parseInt(hex));
    }
    sendData.push(0xf7);
    this._board.send(sendData);
  };

  proto.off = function () {
    this._board.send([0xf0, 4, 8, 2, 0xf7]);
  };

  proto.clear = function () {
    this._board.send([0xf0, 4, 8, 2, 0xf7]);
  };

  scope.module.Max7219 = Max7219;
}));