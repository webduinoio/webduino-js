+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var Led = scope.module.Led,
    Module = scope.Module,
    proto;

  function RGBLed(board, redLedPin, greenLedPin, blueLedPin, driveMode) {
    Module.call(this);

    if (driveMode === undefined) {
      driveMode = RGBLed.COMMON_ANODE;
    }

    this._board = board;
    this._redLed = new Led(board, redLedPin, driveMode);
    this._greenLed = new Led(board, greenLedPin, driveMode);
    this._blueLed = new Led(board, blueLedPin, driveMode);
  }

  function hexToR(h) {
    return parseInt(h.substring(0, 2), 16)
  }

  function hexToG(h) {
    return parseInt(h.substring(2, 4), 16)
  }

  function hexToB(h) {
    return parseInt(h.substring(4, 6), 16)
  }

  function cutHex(h) {
    return (h.charAt(0) == "#") ? h.substring(1, 7) : h
  }

  RGBLed.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: RGBLed
    }
  });

  proto.setColor = function (red, green, blue) {
    if (typeof green === 'undefined' && typeof blue === 'undefined') {
      var color = cutHex(red);
      red = hexToR(color);
      green = hexToG(color);
      blue = hexToB(color);
    }

    red = red / 255;
    green = green / 255;
    blue = blue / 255;

    this._redLed.intensity = red;
    this._greenLed.intensity = green;
    this._blueLed.intensity = blue;
  };

  RGBLed.COMMON_ANODE = Led.SYNC_DRIVE;
  RGBLed.COMMON_CATHODE = Led.SOURCE_DRIVE;

  scope.module.RGBLed = RGBLed;
}));
