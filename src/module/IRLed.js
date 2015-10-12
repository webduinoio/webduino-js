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

  proto.send = function(code) {
    var aryCode = [0x09, 0x04, 0x20];
    code = code || this._encode;
    if (code) {
      code.match(/\w{2}/g).forEach(function(val) {
        aryCode.push(parseInt(val, 16));
      });
      this._board.sendSysex(0x04, aryCode);
    }
  };

  proto.updateEncode = function(code) {
    this._encode = code;
  };

  scope.module.IRLed = IRLed;
}));
