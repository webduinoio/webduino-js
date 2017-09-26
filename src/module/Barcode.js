+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var Module = scope.Module,
    BoardEvent = scope.BoardEvent,
    proto;

  var BARCODE_MESSAGE = [0x04, 0x16];

  var BarcodeEvent = {

    /**
     * Fires when the barcode scanner scans a code.
     *
     * @event BarcodeEvent.MESSAGE
     */
    MESSAGE: 'message'
  };

  /**
   * The Barcode class.
   *
   * @namespace webduino.module
   * @class Barcode
   * @constructor
   * @param {webduino.Board} board The board the barcode scanner is attached to.
   * @param {webduino.Pin | Number} rxPin Receivin pin (number) the barcode scanner is connected to.
   * @param {webduino.Pin | Number} txPin Transmitting pin (number) the barcode scanner is connected to.
   * @extends webduino.Module
   */
  function Barcode(board, rxPin, txPin) {
    Module.call(this);
    this._board = board;
    this._rx = !isNaN(rxPin) ? board.getDigitalPin(rxPin) : rxPin;
    this._tx = !isNaN(txPin) ? board.getDigitalPin(txPin) : txPin;

    this._init = false;
    this._scanData = '';
    this._callback = function () {};
    this._messageHandler = onMessage.bind(this);
    this._board.send([0xf0, 0x04, 0x16, 0x00,
      this._rx._number, this._tx._number, 0xf7
    ]);
  }

  function onMessage(event) {
    var msg = event.message;
    if (msg[0] == BARCODE_MESSAGE[0] && msg[1] == BARCODE_MESSAGE[1]) {
      this.emit(BarcodeEvent.MESSAGE, msg.slice(2));
    }
  }

  Barcode.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: Barcode
    },

    /**
     * The state indicating whether the module is scanning.
     * 
     * @attribute state
     * @type {String} 'on' or 'off'
     */
    state: {
      get: function () {
        return this._state;
      },
      set: function (val) {
        this._state = val;
      }
    }
  });

  /**
   * Start scanning.
   *
   * @method scan
   * @param {Function} [callback] Scanning callback.
   */
  
  /**
   * Start scanning.
   *
   * @method on
   * @param {Function} [callback] Scanning callback.
   * @deprecated `on()` is deprecated, use `scan()` instead.
   */
  proto.scan = proto.on = function(callback) {
    var _this = this;
    this._board.send([0xf0, 0x04, 0x16, 0x01, 0xf7]);
    if (typeof callback !== 'function') {
      callback = function () {};
    }
    this._callback = function (rawData) {
      var scanData = '';
      for (var i = 0; i < rawData.length; i++) {
        scanData += String.fromCharCode(rawData[i]);
      }
      _this._scanData = scanData;
      callback(_this._scanData);
    };
    this._state = 'on';
    this._board.on(BoardEvent.SYSEX_MESSAGE, this._messageHandler);
    this.addListener(BarcodeEvent.MESSAGE, this._callback);
  };

  /**
   * Stop scanning.
   *
   * @method off
   */
  proto.off = function () {
    this._state = 'off';
    this._board.send([0xf0, 0x04, 0x16, 0x02, 0xf7]);
    this._board.removeListener(BoardEvent.SYSEX_MESSAGE, this._messageHandler);
    this.removeListener(BarcodeEvent.MESSAGE, this._callback);
    this._callback = null;
  };

  scope.module.Barcode = Barcode;
}));
