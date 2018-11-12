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
    BoardEvent = scope.BoardEvent,
    proto;

  function Bit(options) {
    if (typeof options === 'string') {
      options = {
        url: options
      };
    }
    options = util.extend(getDefaultOptions(options), options);
    options.server = parseServer(options.server);

    Board.call(this, options);
  }

  function getDefaultOptions(opts) {
    return {
      transport: 'websocket',
      server: Bit.DEFAULT_SERVER,
      login: 'admin',
      password: 'password',
      autoReconnect: false,
      multi: false
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

  proto.startup = async function () {
    this._isReady = true;
    if (this._options.transport === 'serial') {
      // wait for physical board ready to receive data from serialPort
      await delay(0.5);
      this.send([0xf0, 0x0e, 0x0c, 0xf7]);
    }
    this.emit(BoardEvent.READY, this);
  };


  scope.board.Bit = Bit;

}));