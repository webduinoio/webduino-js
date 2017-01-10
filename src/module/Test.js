+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var self;
  var proto;
  var sendLength = 50;
  var sendArray = [];
  var sending = false;
  var sendAck = '';
  var sendCallback;
  var Module = scope.Module;

  function ${ComponentName}(board) {
    Module.call(this);
    this._board = board;
    self = this;
    board.send([0xF0, 0x04, 0x01, 0x0, 0xF7]);
    board.on(webduino.BoardEvent.SYSEX_MESSAGE,
      function (event) {
        var m = event.message;
        sending = false;
      });
    startQueue(board);
  }

  Test.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: Test
    },
    text: {
      get: function () {
        return _textSize;
      },
      set: function (val) {
        _textSize = val;
      }
    }
  });

  proto.api1 = function () {
    
  }

  function startQueue(board) {
    setInterval(function () {
      if (sending || sendArray.length == 0) {
        return;
      }
      sending = true;
      var sendObj = sendArray.shift();
      sendAck = sendObj.ack;
      if (sendAck > 0) {
        board.send(sendObj.obj);
      } else {
        sending = false;
        sendCallback();
      }
    }, 0);
  }

  scope.module.TEST = TEST;
}));