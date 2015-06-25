+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var util = scope.util,
    TransportEvent = scope.TransportEvent,
    Board = scope.Board,
    proto;

  function WebArduino(options) {
    if (typeof options === 'string') {
      options = {
        device: options
      };
    }
    options = util.extend(util.extend({}, getDefaultOptions()), options);
    options.url = dertermineServerUrl(options.server) + '/';

    Board.call(this, options);
  }

  function getDefaultOptions() {
    return {
      transport: 'mqtt',
      server: WebArduino.DEFAULT_SERVER,
      login: 'admin',
      password: 'password'
    };
  }

  function dertermineServerUrl(url) {
    if (url.indexOf('ws://') === 0 || url.indexOf('wss://') === 0) {
      return url;
    } else {
      return (typeof location !== 'undefined' && location.protocol === 'https:' ? 'wss://' : 'ws://') + url;
    }
  }

  WebArduino.prototype = proto = Object.create(Board.prototype, {
    constructor: {
      value: WebArduino
    }
  });

  proto.reportFirmware = function () {
    var msg = [
      240, 121, 2, 4, 119, 0, 101, 0, 98, 0, 100, 0, 117, 0, 105, 0,
      110, 0, 111, 0, 46, 0, 105, 0, 110, 0, 111, 0, 247
    ];
    mockMessageEvent(this, msg);
  };

  proto.queryCapabilities = function () {
    var msg = [
      240, 108, 127, 127,
      0, 1, 1, 1, 4, 14, 127,
      0, 1, 1, 1, 3, 8, 4, 14, 127,
      0, 1, 1, 1, 4, 14, 127,
      0, 1, 1, 1, 3, 8, 4, 14, 127,
      0, 1, 1, 1, 3, 8, 4, 14, 127,
      0, 1, 1, 1, 4, 14, 127,
      0, 1, 1, 1, 4, 14, 127,
      0, 1, 1, 1, 3, 8, 4, 14, 127,
      0, 1, 1, 1, 3, 8, 4, 14, 127,
      0, 1, 1, 1, 3, 8, 4, 14, 127,
      0, 1, 1, 1, 4, 14, 127,
      0, 1, 1, 1, 4, 14, 127,
      0, 1, 1, 1, 2, 10, 4, 14, 127,
      0, 1, 1, 1, 2, 10, 4, 14, 127,
      0, 1, 1, 1, 2, 10, 4, 14, 127,
      0, 1, 1, 1, 2, 10, 4, 14, 127,
      0, 1, 1, 1, 2, 10, 4, 14, 127,
      0, 1, 1, 1, 2, 10, 4, 14, 127,
      2, 10, 127, 2, 10, 127, 247
    ];
    mockMessageEvent(this, msg);
  };

  proto.queryAnalogMapping = function () {
    var msg = [
      240, 106, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
      0, 1, 2, 3, 4, 5, 6, 7, 247
    ];
    mockMessageEvent(this, msg);
  };

  proto.startup = function () {
    var msg = [144, 0, 0, 145, 0, 0, 146, 0, 0];
    Board.prototype.startup.call(this);
    mockMessageEvent(this, msg);
  };

  WebArduino.DEFAULT_SERVER = 'wss://ws.webduino.io';

  function mockMessageEvent(board, message) {
    board._transport.emit(TransportEvent.MESSAGE, message);
  }

  scope.WebArduino = WebArduino;
}));
