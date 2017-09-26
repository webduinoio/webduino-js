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

    /**
     * Fires when a transport is opened.
     * 
     * @event TransportEvent.OPEN
     */
    OPEN: 'open',

    /**
     * Fires when a transport receives a message.
     * 
     * @event TransportEvent.MESSAGE
     */
    MESSAGE: 'message',

    /**
     * Fires when a transport get an error.
     * 
     * @event TransportEvent.ERROR
     */
    ERROR: 'error',

    /**
     * Fires when a transport is closed.
     * 
     * @event TransportEvent.CLOSE
     */
    CLOSE: 'close'
  };

  /**
   * A messaging mechanism to carry underlying firmata messages. This is an abstract class meant to be extended.
   *
   * @namespace webduino
   * @class Transport
   * @constructor
   * @param {Object} options Options to build the transport instance.
   * @extends webduino.EventEmitter
   */
  function Transport(options) {
    EventEmitter.call(this);
  }

  Transport.prototype = proto = Object.create(EventEmitter.prototype, {

    constructor: {
      value: Transport
    },

    /**
     * Indicates if the state of the transport is open.
     *
     * @attribute isOpen
     * @type {Boolean}
     * @readOnly
     */
    isOpen: {
      value: false
    }

  });

  /**
   * Send payload through the transport.
   *
   * @method send
   * @param {Array} payload The actual data to be sent.
   */
  proto.send = function (payload) {
    throw new Error('direct call on abstract method.');
  };

  /**
   * Close and terminate the transport.
   *
   * @method close
   */
  proto.close = function () {
    throw new Error('direct call on abstract method.');
  };

  /**
   * Flush any buffered data of the transport.
   *
   * @method flush
   */
  proto.flush = function () {
    throw new Error('direct call on abstract method.');
  };

  scope.TransportEvent = TransportEvent;
  scope.Transport = Transport;
  scope.transport = scope.transport || {};
}));
