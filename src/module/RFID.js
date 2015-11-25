+(function(factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function(scope) {
  'use strict';

  var Module = scope.Module,
    BoardEvent = scope.BoardEvent,
    proto;

  var RFIDEvent = {
    MESSAGE: 'message'
  };

  function RFID(board) {
    Module.call(this);
    this._board = board;
    this._messageHandler = onMessage.bind(this);
    this._callback = function() {};
    this._state = 'off';
    this._board.send([0xf0, 0x04, 0x0f, 0x00, 0xf7]);
  }

  function onMessage(event) {
    var msg = event.message;
    var val;

    if (!msg.length) {
      return false;
    }

    if (msg.length === 1) {
      val = 0;
    } else {
      val = String.fromCharCode.apply(null, msg);
    }

    this.emit(RFIDEvent.MESSAGE, val);
  }

  RFID.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: RFID
    },
    state: {
      get: function() {
        return this._state;
      },
      set: function(val) {
        this._state = val;
      }
    }
  });

  proto.on = function(callback) {
    this._board.send([0xf0, 0x04, 0x0f, 0x01,0xf7]);

    if (typeof callback !== 'function') {
      callback = function() {};
    }

    this._callback = callback;
    this._state = 'on';
    this._board.on(BoardEvent.SYSEX_MESSAGE, this._messageHandler);
    this.addListener(RFIDEvent.MESSAGE, this._callback);
  };

  proto.off = function() {
    this._state = 'off';
    this._board.send([0xf0, 0x04, 0x0f, 0x02, 0xf7]);
    this._board.removeListener(BoardEvent.SYSEX_MESSAGE, this._messageHandler);
    this.removeListener(RFIDEvent.MESSAGE, this._callback);
    this._callback = null;
  };

  scope.module.RFID = RFID;
}));
