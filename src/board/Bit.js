+(function (global, factory) {
  if (typeof exports === 'undefined') {
    factory(global.webduino || {});
  } else {
    module.exports = factory;
  }
}(this, function (scope) {
  'use strict';

  var util = scope.util,
    Board = scope.Board,
    BoardEvent = scope.BoardEvent,
    proto;

  function Bit(options) {
    if (typeof options === 'string') {
      options = {
        url: options
      };
    }
    options = util.extend(getDefaultOptions(), options);
    options.server = parseServer(options.server);

    Board.call(this, options);
  }

  function getDefaultOptions() {
    return {
      transport: 'websocket',
      server: Bit.DEFAULT_SERVER,
      login: 'admin',
      password: 'password',
      autoReconnect: false,
      multi: false,
      initialReset: true,
      handleDigitalPins: true
    };
  }

  function parseServer(url) {
    if (url.indexOf('://') === -1) {
      url = (typeof location !== 'undefined' &&
          location.protocol === 'https:' ? 'wss:' : 'ws:') +
        '//' + url;
    }
    url = util.parseURL(url);
    return url.protocol + '//' + url.host + '/';
  }

  Bit.prototype = proto = Object.create(Board.prototype, {
    constructor: {
      value: Bit
    }
  });

  Bit.DEFAULT_SERVER = 'wss://ws.webduino.io:443';
  Bit.SERVER_CHINA = 'wss://ws.webduino.com.cn';

  proto.startup = function () {
    this._isReady = true;
    this.emit(BoardEvent.READY, this);
    setTimeout(function() {
      if (this._options.transport === 'serial') {
        // wait for physical board ready to receive data from serialPort
        this.send([0xf0, 0x0e, 0x0c, 0xf7]);
      }
    }.bind(this), 500);
  };


  scope.board.Bit = Bit;

}));