+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var Pin = scope.Pin,
    Module = scope.Module,
    proto;

  function Relay(board, pin) {
    Module.call(this);

    this._type = 'KY-019';
    this._board = board;
    this._pin = pin;

    this._onValue = 1;
    this._offValue = 0;

    board.setDigitalPinMode(pin.number, Pin.DOUT);

    this.off();
  }

  Relay.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: Relay
    }
  });

  proto.on = function () {
    this._pin.value = this._onValue;
  };

  proto.off = function () {
    this._pin.value = this._offValue;
  };

  proto.toggle = function () {
    this._pin.value = 1 - this._pin.value;
  };

  scope.module.Relay = Relay;
}));
