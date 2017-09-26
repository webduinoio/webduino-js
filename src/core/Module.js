+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var EventEmitter = scope.EventEmitter;

  /**
   * A component to be attached to a board. This is an abstract class meant to be extended.
   *
   * @namespace webduino
   * @class Module
   * @constructor
   * @extends webduino.EventEmitter
   */
  function Module() {
    EventEmitter.call(this);
  }

  Module.prototype = Object.create(EventEmitter.prototype, {

    constructor: {
      value: Module
    },

    /**
     * Type of the module.
     *
     * @attribute type
     * @type {String}
     * @readOnly
     */
    type: {
      get: function () {
        return this._type;
      }
    }

  });

  scope.Module = Module;
  scope.module = scope.module || {};
}));
