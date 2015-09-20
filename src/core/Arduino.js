+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var util = scope.util,
    Board = scope.Board,
    BoardEvent = scope.BoardEvent,
    proto;

  function Arduino(options) {
    if (typeof options === 'string') {
      options = {
        path: options
      };
    }
    options = util.extend(getDefaultOptions(options), options);

    Board.call(this, options);
  }

  function getDefaultOptions(opts) {
    return {
      transport: 'serial',
      baudRate: 57600
    };
  }

  Arduino.prototype = proto = Object.create(Board.prototype, {
    constructor: {
      value: Arduino
    }
  });

  proto.begin = function () {
    this.once(BoardEvent.FIRMWARE_NAME, this._initialVersionResultHandler);
  };

  scope.Arduino = Arduino;
}));
