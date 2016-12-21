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
    BoardEvent = scope.BoardEvent,
    proto;

  /**
   * The Max7219 Class.
   *
   * MAX7219 is compact, serial input/output
   * common-cathode display drivers that interface
   * microprocessors (µPs) to 7-segment numeric LED displays
   * of up to 8 digits, bar-graph displays, or 64 individual LEDs.
   * 
   * @namespace webduino.module
   * @class Max7219
   * @constructor
   * @param {webduino.Board} board The board that the Max7219 is attached to.
   * @param {Integer} din Pin number of DIn (Data In).
   * @param {Integer} cs Pin number of LOAD/CS.
   * @param {Integer} clk Pin number of CLK.
   * @extends webduino.Module
   */
  function Max7219(board, din, cs, clk) {
    Module.call(this);
    this._board = board;
    this._din = din;
    this._cs = cs;
    this._clk = clk;
    this._intensity = 0;
    this._data = 'ffffffffffffffff';

    this._board.on(BoardEvent.BEFOREDISCONNECT, this.animateStop.bind(this));
    this._board.on(BoardEvent.ERROR, this.animateStop.bind(this));
    this._board.send([0xf0, 4, 8, 0, din.number, cs.number, clk.number, 0xf7]);
  }

  Max7219.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: Max7219
    },

    /**
     * The intensity indicating brightness of Max7219.
     * 
     * @attribute intensity
     * @type {Integer} Value of brightness (0~15).
     */
    intensity: {
      get: function () {
        return this._intensity;
      },
      set: function (val) {
        if (val >= 0 && val <= 15) {
          this._board.send([0xf0, 4, 8, 3, val, 0xf7]);
          this._intensity = val;
        }
      }
    }
  });

  /**
   * Show pattern LED matrix.
   *
   * @method on
   * @param {String} data Pattern to display.
   * @example
   *     matrix.on("0000000000000000");
   */
  proto.on = function (data) {
    if (data) {
      this._data = data;
    } else {
      data = this._data;
    }

    if (!data) {
      return false;
    }

    var sendData = [0xf0, 4, 8, 1];
    var i = 0;
    var len = data.length;

    for (; i < len; i++) {
      sendData.push(data.charCodeAt(i));
    }

    sendData.push(0xf7);
    this._board.send(sendData);
  };

  /**
   * Clear pattern on LED matrix.
   *
   * @method off
   */
  proto.off = function () {
    this._board.send([0xf0, 4, 8, 2, 0xf7]);
  };

  /**
   * Display animated pattern.
   *
   * @method animate
   * @param {Array} data Array of patterns.
   * @param {Integer} times Delay time (in microsecond) between patterns.
   * @param {Integer} duration Duration of animation.
   * @param {Function} callback Callback after animation.
   * @example
   *     var data = ["080c0effff0e0c08", "387cfefe82443800", "40e0e0e07f030604"];
   *         matrix.on("0000000000000000");
   *         matrix.animate(data, 100);
   */
  proto.animate = function (data, times, duration, callback) {
    var p = 0;

    if (typeof arguments[arguments.length - 1] === 'function') {
      callback = arguments[arguments.length - 1];
    } else {
      callback = function () {};
    }

    var run = function () {
      this.on(data[p++ % data.length]);
      this._timer = setTimeout(run, times);
    }.bind(this);

    var stop = function () {
      clearTimeout(this._timer);
      callback();
    }.bind(this);

    if (times && times > 0) {
      run();
    }

    if (duration && duration > 0) {
      this._timerDuration = setTimeout(stop, duration);
    }
  };

  /**
   * Stop displaying animated pattern.
   *
   * @method animateStop
   */
  proto.animateStop = function () {
    clearTimeout(this._timer);
    clearTimeout(this._timerDuration);
  };

  scope.module.Max7219 = Max7219;
}));
