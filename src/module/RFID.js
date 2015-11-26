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
    ENTER: 'enter',
    LEAVE: 'leave'
  };

  function RFID(board) {
    Module.call(this);
    this._board = board;
    this._messageHandler = onMessage.bind(this);
    this._isListened = false;
    this._enterHandlers = [];
    this._leaveHandlers = [];
    this._board.send([0xf0, 0x04, 0x0f, 0x00, 0xf7]);
  }

  function onMessage(event) {
    var _this = this;
    var msg = event.message;
    var val;

    if (!msg.length) {
      return false;
    }

    if (msg.length === 1) {
      val = 0;
      _this._leaveHandlers.forEach(function(fn, idx, ary) {
        fn.call(_this, val);
      });
      _this.emit(RFIDEvent.LEAVE, val);
    } else {
      val = String.fromCharCode.apply(null, msg);
      _this._enterHandlers.forEach(function(fn, idx, ary) {
        fn.call(_this, val);
      });
      _this.emit(RFIDEvent.ENTER, val);
    }
  }

  RFID.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: RFID
    }
  });

  proto.listen = function(enterHander, leaveHandler) {
    if (!this._isListened) {
      this._isListened = true;
      this._board.send([0xf0, 0x04, 0x0f, 0x01,0xf7]);
      this._board.on(BoardEvent.SYSEX_MESSAGE, this._messageHandler);
    }

    if (typeof enterHander === 'function') {
      this._enterHandlers.push(enterHander);
    }

    if (typeof leaveHandler === 'function') {
      this._leaveHandlers.push(leaveHandler);
    }
  };

  proto.stopListen = function() {
    this._board.send([0xf0, 0x04, 0x0f, 0x02, 0xf7]);
    this._board.removeListener(BoardEvent.SYSEX_MESSAGE, this._messageHandler);
    this._isListened = false;
    this._enterHandlers = [];
    this._leaveHandlers = [];
  };

  proto.isListened = function() {
    return this._isListened;
  };

  proto.off = function(evtType, handler) {
    this.removeListener(evtType, handler);
  };

  proto.destroy = function() {
    this.stopListen();
    this.removeAllListeners(RFIDEvent.ENTER);
    this.removeAllListeners(RFIDEvent.LEAVE);
  };

  scope.module.RFID = RFID;
}));
