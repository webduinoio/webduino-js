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

  function Smart(options) {
    if (typeof options === 'string') {
      options = {
        url: options
      };
    }
    options = util.extend(getDefaultOptions(options), options);

    Board.call(this, options);
  }

  function getDefaultOptions(opts) {
    return {
      transport: 'websocket'
    };
  }

  Smart.prototype = proto = Object.create(Board.prototype, {
    constructor: {
      value: Smart
    }
  });

  scope.board.Smart = Smart;
}));
