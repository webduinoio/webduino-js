+(function(factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function(scope) {
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

  proto.startup = function() {
    this._isReady = true;
    this.getPin(35).setMode(2); //set analogNum 7 = pin35
    this.emit(webduino.BoardEvent.READY, this);
  };

  Bit.DEFAULT_SERVER = 'wss://ws.webduino.io:443';


  scope.board.Bit = Bit;

}));