+(function(factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function(scope) {
  'use strict';

  var Module = scope.Module,
    proto;

  function IRLed(board, encode) {
    Module.call(this);
    this._board = board;
    this._encode = encode;
    this._board.send([0xf4, 0x09, 0x03, 0xe9, 0x00, 0x00]);
  }

  IRLed.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: IRLed
    }
  });

  proto.send = function(callback) {
    var aryCode = [0x09, 0x04, 0x20];
    if (this._encode) {
      this._encode.match(/\w{2}/g).forEach(function(val) {
        aryCode.push(parseInt(val, 16));
      });
      this._board.sendSysex(0x04, aryCode);
    }
  };

  scope.module.IRLed = IRLed;
}));
