+(function (global, factory) {
  if (typeof exports === 'undefined') {
    factory(global.webduino || {});
  } else {
    module.exports = factory;
  }
}(this, function (scope) {
  'use strict';

  var DEBUG_STR = 'DEBUG_WEBDUINOJS';

  function Logger(option) {
    if (!option) {
      option = '*';
    }
    if (typeof option === 'string') {
      option = { key: option };
    }
    this._option = option;
    this._key = option.key;
    this._isShow = isShow.bind(this);
    init.call(this);
  }

  function hasLocalStorage() {
    try {
      return !!localStorage;
    } catch (err) {
      return false;
    }
  }

  function hasProcess() {
    try {
      return !!process;
    } catch (err) {
      return false;
    }
  }

  function isShow() {
    var debugKeys = [];
    var debugStr;

    if (hasLocalStorage()) {
      debugStr = localStorage.getItem(DEBUG_STR);
    }

    if (hasProcess()) {
      debugStr = process.env[DEBUG_STR];
    }
    
    if (debugStr) {
      debugKeys = debugStr.split(',').map(function (val) {
        return val.trim();
      });
    }

    if (debugStr && (debugKeys.indexOf('*') !== -1 || debugKeys.indexOf(this._key) !== -1)) {
      return true;
    }

    return false;
  }

  function init() {
    var self = this;
    var methodNames = ['log', 'info', 'warn', 'error'];
    var noop = function () { };
    var isCopy = this._isShow();
    
    methodNames.forEach(function (name) {
      if (isCopy) {
        self[name] = Function.prototype.bind.call(console[name], console);
      } else {
        self[name] = noop;
      }
    });
  }

  scope.Logger = Logger;
}));
