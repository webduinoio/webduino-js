+(function (global, factory) {
  if (typeof exports === 'undefined') {
    factory(global.webduino || {});
  } else {
    module.exports = factory;
  }
}(this, function (scope) {
  'use strict';

  var util = scope.util,
    Board = scope.Board;

  function Smart(options) {
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
      server: Smart.DEFAULT_SERVER,
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

  Smart.prototype = Object.create(Board.prototype, {
    constructor: {
      value: Smart
    }
  });

  Smart.DEFAULT_SERVER = 'wss://ws.webduino.io:443';
  Smart.SERVER_CHINA = 'wss://ws.webduino.com.cn';

  scope.board.Smart = Smart;
}));
