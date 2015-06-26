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

  var PinEvent = {
    CHANGE: 'change',
    RISING_EDGE: 'risingEdge',
    FALLING_EDGE: 'fallingEdge'
  };

  function Pin(number, type) {
    EventEmitter.call(this);

    this._type = type;
    this._capabilities = {};
    this._number = number;
    this._analogNumber = undefined;
    this._analogWriteResolution = 255; // default
    this._analogReadResolution = 1023; // default
    this._value = 0;
    this._lastValue = -1;
    this._preFilterValue = 0;
    this._average = 0;
    this._minimum = Math.pow(2, 16);
    this._maximum = 0;
    this._sum = 0;
    this._numSamples = 0;
    this._filters = null;
    this._generator = null;
    this._state = undefined;
    this._autoSetValueCallback = this.autoSetValue.bind(this);
  }

  Pin.prototype = proto = Object.create(EventEmitter.prototype, {

    constructor: {
      value: Pin
    },

    capabilities: {
      get: function () {
        return this._capabilities;
      }
    },

    analogNumber: {
      get: function () {
        return this._analogNumber;
      }
    },

    number: {
      get: function () {
        return this._number;
      }
    },

    analogWriteResolution: {
      get: function () {
        return this._analogWriteResolution;
      }
    },

    analogReadResolution: {
      get: function () {
        return this._analogReadResolution;
      }
    },

    state: {
      get: function () {
        return this._state;
      }
    },

    average: {
      get: function () {
        return this._average;
      }
    },

    minimum: {
      get: function () {
        return this._minimum;
      }
    },

    maximum: {
      get: function () {
        return this._maximum;
      }
    },

    value: {
      get: function () {
        return this._value;
      },
      set: function (val) {
        this._lastValue = this._value;
        this._preFilterValue = val;
        this._value = this.applyFilters(val);
        this.calculateMinMaxAndMean(this._value);
        this.detectChange(this._lastValue, this._value);
      }
    },

    lastValue: {
      get: function () {
        return this._lastValue;
      }
    },

    preFilterValue: {
      get: function () {
        return this._preFilterValue;
      }
    },

    filters: {
      get: function () {
        return this._filters;
      },
      set: function (filters) {
        this._filters = filters;
      }
    },

    generator: {
      get: function () {
        return this._generator;
      }
    }

  });

  proto.setAnalogNumber = function (num) {
    this._analogNumber = num;
  };

  proto.setAnalogWriteResolution = function (value) {
    this._analogWriteResolution = value;
  };

  proto.setAnalogReadResolution = function (value) {
    this._analogReadResolution = value;
  };

  proto.setState = function (state) {
    if (this._type === Pin.PWM) {
      state = state / this._analogWriteResolution;
    }
    this._state = state;
  };

  proto.setType = function (type) {
    if (type >= 0 && type < Pin.TOTAL_PIN_MODES) {
      this._type = type;
    }
  };

  proto.setCapabilities = function (capabilities) {
    this._capabilities = capabilities;
    var analogWriteRes = this._capabilities[Pin.PWM];
    var analogReadRes = this._capabilities[Pin.AIN];
    if (analogWriteRes) {
      this._analogWriteResolution = Math.pow(2, analogWriteRes) - 1;
    }
    if (analogReadRes) {
      this._analogReadResolution = Math.pow(2, analogReadRes) - 1;
    }
  };

  proto.detectChange = function (oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    this.emit(PinEvent.CHANGE, this);
    if (oldValue <= 0 && newValue !== 0) {
      this.emit(PinEvent.RISING_EDGE, this);
    } else if (oldValue !== 0 && newValue <= 0) {
      this.emit(PinEvent.FALLING_EDGE, this);
    }
  };

  proto.clearWeight = function () {
    this._sum = this._average;
    this._numSamples = 1;
  };

  proto.calculateMinMaxAndMean = function (val) {
    var MAX_SAMPLES = Number.MAX_VALUE;

    this._minimum = Math.min(val, this._minimum);
    this._maximum = Math.max(val, this._maximum);
    this._sum += val;
    this._average = this._sum / (++this._numSamples);
    if (this._numSamples >= MAX_SAMPLES) {
      this.clearWeight();
    }
  };

  proto.clear = function () {
    this._minimum = this._maximum = this._average = this._lastValue = this._preFilterValue;
    this.clearWeight();
  };

  proto.addFilter = function (newFilter) {
    if (newFilter === null) {
      return;
    }
    if (this._filters === null) {
      this._filters = [];
    }
    this._filters.push(newFilter);
  };

  proto.removeFilter = function (filterToRemove) {
    var index;

    if (this._filters.length < 1) {
      return;
    }
    index = this._filters.indexOf(filterToRemove);
    if (index !== -1) {
      this._filters.splice(index, 1);
    }
  };

  proto.addGenerator = function (newGenerator) {
    this.removeGenerator();
    this._generator = newGenerator;
    this._generator.on('update', this._autoSetValueCallback);
  };

  proto.removeGenerator = function () {
    if (this._generator !== null) {
      this._generator.removeListener('update', this._autoSetValueCallback);
    }
    delete this._generator;
  };

  proto.removeAllFilters = function () {
    delete this._filters;
  };

  proto.autoSetValue = function (val) {
    this.value = val;
  };

  proto.applyFilters = function (val) {
    var result;

    if (this._filters === null) {
      return val;
    }
    result = val;
    var len = this._filters.length;
    for (var i = 0; i < len; i++) {
      result = this._filters[i].processSample(result);
    }
    return result;
  };

  Pin.HIGH = 1;
  Pin.LOW = 0;
  Pin.ON = 1;
  Pin.OFF = 0;
  Pin.DIN = 0x00;
  Pin.DOUT = 0x01;
  Pin.AIN = 0x02;
  Pin.AOUT = 0x03;
  Pin.PWM = 0x03;
  Pin.SERVO = 0x04;
  Pin.SHIFT = 0x05;
  Pin.I2C = 0x06;
  Pin.ONEWIRE = 0x07;
  Pin.STEPPER = 0x08;
  Pin.TOTAL_PIN_MODES = 9;

  scope.PinEvent = PinEvent;
  scope.Pin = Pin;
}));
