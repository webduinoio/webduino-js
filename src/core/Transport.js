+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var EventEmitter = scope.EventEmitter,
    proto;

  var TransportEvent = {
    OPEN: 'open',
    READY: 'ready',
    MESSAGE: 'message',
    ERROR: 'error',
    CLOSE: 'close'
  };

  function Transport(options) {
    EventEmitter.call(this);
  }

  Transport.prototype = proto = Object.create(EventEmitter.prototype, {
    constructor: {
      value: Transport
    }
  });

  proto.send = function (payload) {
    throw new Error('error: direct call on abstract method.');
  };

  proto.close = function () {
    throw new Error('error: direct call on abstract method.');
  };

  scope.TransportEvent = TransportEvent;
  scope.Transport = Transport;
  scope.transport = scope.transport || {};
}));
