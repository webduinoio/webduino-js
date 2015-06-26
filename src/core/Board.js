+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var EventEmitter = scope.EventEmitter,
    TransportEvent = scope.TransportEvent,
    Transport = scope.Transport,
    PinEvent = scope.PinEvent,
    Pin = scope.Pin,
    util = scope.util,
    proto;

  var BoardEvent = {
    ANALOG_DATA: 'analogData',
    DIGITAL_DATA: 'digitalData',
    FIRMWARE_VERSION: 'firmwareVersion',
    FIRMWARE_NAME: 'firmwareName',
    STRING_MESSAGE: 'stringMessage',
    SYSEX_MESSAGE: 'sysexMessage',
    PIN_STATE_RESPONSE: 'pinStateResponse',
    READY: 'ready',
    ERROR: 'error'
  };

  // Message command bytes (128-255/0x80-0xFF)
  var DIGITAL_MESSAGE = 0x90,
    ANALOG_MESSAGE = 0xE0,
    REPORT_ANALOG = 0xC0,
    REPORT_DIGITAL = 0xD0,
    SET_PIN_MODE = 0xF4,
    REPORT_VERSION = 0xF9,
    SYSEX_RESET = 0xFF,
    START_SYSEX = 0xF0,
    END_SYSEX = 0xF7;

  // Extended command set using sysex (0-127/0x00-0x7F)
  var SERVO_CONFIG = 0x70,
    STRING_DATA = 0x71,
    SHIFT_DATA = 0x75,
    I2C_REQUEST = 0x76,
    I2C_REPLY = 0x77,
    I2C_CONFIG = 0x78,
    EXTENDED_ANALOG = 0x6F,
    PIN_STATE_QUERY = 0x6D,
    PIN_STATE_RESPONSE = 0x6E,
    CAPABILITY_QUERY = 0x6B,
    CAPABILITY_RESPONSE = 0x6C,
    ANALOG_MAPPING_QUERY = 0x69,
    ANALOG_MAPPING_RESPONSE = 0x6A,
    REPORT_FIRMWARE = 0x79,
    SAMPLING_INTERVAL = 0x7A,
    SYSEX_NON_REALTIME = 0x7E,
    SYSEX_REALTIME = 0x7F;

  var MIN_SAMPLING_INTERVAL = 10,
    MAX_SAMPLING_INTERVAL = 100;

  function Board(options) {
    EventEmitter.call(this);

    this._options = options;
    this._buf = [];
    this._digitalPort = [];
    this._numPorts = 0;
    this._analogPinMapping = [];
    this._digitalPinMapping = [];
    this._i2cPins = [];
    this._ioPins = [];
    this._totalPins = 0;
    this._totalAnalogPins = 0;
    this._samplingInterval = 19;
    this._isReady = false;
    this._firmwareName = '';
    this._firmwareVersion = 0;
    this._capabilityQueryResponseReceived = false;
    this._numPinStateRequests = 0;
    this._transport = null;
    this._pinStateEventCenter = new EventEmitter();

    this._initialVersionResultHandler = onInitialVersionResult.bind(this);
    this._sendOutHandler = sendOut.bind(this);
    this._readyHandler = onReady.bind(this);
    this._messageHandler = onMessage.bind(this);
    this._errorHandler = onError.bind(this);

    this.setTransport(this._options.transport || 0);
  }

  function onInitialVersionResult(event) {
    var version = event.version * 10,
      name = event.name;

    if (version >= 23) {
      // TODO: do reset and handle response
      // this.systemReset();
      this.queryCapabilities();
    } else {
      throw new Error('error: You must upload StandardFirmata version 2.3 ' +
        'or greater from Arduino version 1.0 or higher');
    }
  }

  function sendOut(pin) {
    var type = pin._type,
      pinNum = pin.number,
      value = pin.value;

    switch (type) {
    case Pin.DOUT:
      this.sendDigitalData(pinNum, value);
      break;
    case Pin.AOUT:
      this.sendAnalogData(pinNum, value);
      break;
    case Pin.SERVO:
      this.sendServoData(pinNum, value);
      break;
    }
  }

  function onReady() {
    this.begin();
  }

  function onMessage(data) {
    var len = data.length;

    if (len) {
      for (var i = 0; i < len; i++) {
        this.processInput(data[i]);
      }
    } else {
      this.processInput(data);
    }
  }

  function onError(error) {
    this._isReady = false;
    this.emit(BoardEvent.ERROR, error);
  }

  function debug(msg) {
    console && console.log(msg.stack || msg);
  }

  Board.prototype = proto = Object.create(EventEmitter.prototype, {

    constructor: {
      value: Board
    },

    samplingInterval: {
      get: function () {
        return this._samplingInterval;
      },
      set: function (interval) {
        if (interval >= MIN_SAMPLING_INTERVAL && interval <= MAX_SAMPLING_INTERVAL) {
          this._samplingInterval = interval;
          this.send([
            START_SYSEX,
            SAMPLING_INTERVAL,
            interval & 0x007F, (interval >> 7) & 0x007F,
            END_SYSEX
          ]);
        } else {
          throw new Error('warning: Sampling interval must be between ' + MIN_SAMPLING_INTERVAL +
            ' and ' + MAX_SAMPLING_INTERVAL);
        }
      }
    },

    isReady: {
      get: function () {
        return this._isReady;
      }
    }

  });

  proto.begin = function () {
    this.once(BoardEvent.FIRMWARE_NAME, this._initialVersionResultHandler);
    this.reportFirmware();
  };

  proto.processInput = function (inputData) {
    var len, cmd;

    inputData = parseInt(inputData, 10);
    this._buf.push(inputData);
    len = this._buf.length;
    cmd = this._buf[0];

    if (cmd >= 128 && cmd !== START_SYSEX) {
      if (len === 3) {
        this.processMultiByteCommand(this._buf);
        this._buf = [];
      }
    } else if (cmd === START_SYSEX && inputData === END_SYSEX) {
      this.processSysexCommand(this._buf);
      this._buf = [];
    } else if (inputData >= 128 && cmd < 128) {
      this._buf = [];
      if (inputData !== END_SYSEX) {
        this._buf.push(inputData);
      }
    }
  };

  proto.processMultiByteCommand = function (commandData) {
    var command = commandData[0],
      channel;

    if (command < 0xF0) {
      command = command & 0xF0;
      channel = commandData[0] & 0x0F;
    }

    switch (command) {
    case DIGITAL_MESSAGE:
      this.processDigitalMessage(channel, commandData[1], commandData[2]);
      break;
    case REPORT_VERSION:
      this._firmwareVersion = commandData[1] + commandData[2] / 10;
      this.emit(BoardEvent.FIRMWARE_VERSION, {
        version: this._firmwareVersion
      });
      break;
    case ANALOG_MESSAGE:
      this.processAnalogMessage(channel, commandData[1], commandData[2]);
      break;
    }
  };

  proto.processDigitalMessage = function (port, bits0_6, bits7_13) {
    var offset = port * 8,
      lastPin = offset + 8,
      portVal = bits0_6 | (bits7_13 << 7),
      pinVal,
      pin = {};

    if (lastPin >= this._totalPins) {
      lastPin = this._totalPins;
    }

    var j = 0;
    for (var i = offset; i < lastPin; i++) {
      pin = this.getDigitalPin(i);

      if (pin === undefined) {
        return;
      }

      if (pin._type === Pin.DIN) {
        pinVal = (portVal >> j) & 0x01;
        if (pinVal !== pin.value) {
          pin.value = pinVal;
          this.emit(BoardEvent.DIGITAL_DATA, {
            pin: pin
          });
        }
      }
      j++;
    }
  };

  proto.processAnalogMessage = function (channel, bits0_6, bits7_13) {
    var analogPin = this.getAnalogPin(channel);

    if (analogPin === undefined) {
      return;
    }

    analogPin.value = this.getValueFromTwo7bitBytes(bits0_6, bits7_13) / analogPin.analogReadResolution;
    if (analogPin.value !== analogPin.lastValue) {
      this.emit(BoardEvent.ANALOG_DATA, {
        pin: analogPin
      });
    }
  };

  proto.processSysexCommand = function (sysexData) {
    sysexData.shift();
    sysexData.pop();

    var command = sysexData[0];
    switch (command) {
    case REPORT_FIRMWARE:
      this.processQueryFirmwareResult(sysexData);
      break;
    case STRING_DATA:
      this.processSysExString(sysexData);
      break;
    case CAPABILITY_RESPONSE:
      this.processCapabilitiesResponse(sysexData);
      break;
    case PIN_STATE_RESPONSE:
      this.processPinStateResponse(sysexData);
      break;
    case ANALOG_MAPPING_RESPONSE:
      this.processAnalogMappingResponse(sysexData);
      break;
    default:
      this.emit(BoardEvent.SYSEX_MESSAGE, {
        message: sysexData
      });
      break;
    }
  };

  proto.processQueryFirmwareResult = function (msg) {
    var data;

    for (var i = 3, len = msg.length; i < len; i += 2) {
      data = msg[i];
      data += msg[i + 1];
      this._firmwareName += String.fromCharCode(data);
    }
    this._firmwareVersion = msg[1] + msg[2] / 10;
    this.emit(BoardEvent.FIRMWARE_NAME, {
      name: this._firmwareName,
      version: this._firmwareVersion
    });
  };

  proto.processSysExString = function (msg) {
    var str = '',
      data,
      len = msg.length;

    for (var i = 1; i < len; i += 2) {
      data = msg[i];
      data += msg[i + 1];
      str += String.fromCharCode(data);
    }
    this.emit(BoardEvent.STRING_MESSAGE, {
      message: str
    });
  };

  proto.processCapabilitiesResponse = function (msg) {
    var pinCapabilities = {},
      byteCounter = 1,
      pinCounter = 0,
      analogPinCounter = 0,
      len = msg.length,
      type,
      pin;

    this._capabilityQueryResponseReceived = true;

    while (byteCounter <= len) {
      if (msg[byteCounter] === 127) {

        this._digitalPinMapping[pinCounter] = pinCounter;
        type = undefined;

        if (pinCapabilities[Pin.DOUT]) {
          type = Pin.DOUT;
        }

        if (pinCapabilities[Pin.AIN]) {
          type = Pin.AIN;
          this._analogPinMapping[analogPinCounter++] = pinCounter;
        }

        pin = new Pin(pinCounter, type);
        pin.setCapabilities(pinCapabilities);
        this.managePinListener(pin);
        this._ioPins[pinCounter] = pin;

        if (pin._capabilities[Pin.I2C]) {
          this._i2cPins.push(pin.number);
        }

        pinCapabilities = {};
        pinCounter++;
        byteCounter++;
      } else {
        pinCapabilities[msg[byteCounter]] = msg[byteCounter + 1];
        byteCounter += 2;
      }
    }

    this._numPorts = Math.ceil(pinCounter / 8);

    for (var j = 0; j < this._numPorts; j++) {
      this._digitalPort[j] = 0;
    }

    this._totalPins = pinCounter;
    this._totalAnalogPins = analogPinCounter;
    this.queryAnalogMapping();
  };

  proto.processAnalogMappingResponse = function (msg) {
    var len = msg.length;

    for (var i = 1; i < len; i++) {
      if (msg[i] !== 127) {
        this._analogPinMapping[msg[i]] = i - 1;
        this.getPin(i - 1).setAnalogNumber(msg[i]);
      }
    }

    this.startup();
  };

  proto.startup = function () {
    this._isReady = true;
    this.emit(BoardEvent.READY);
  };

  proto.systemReset = function () {
    this.send(SYSEX_RESET);
  };

  proto.processPinStateResponse = function (msg) {
    if (this._numPinStateRequests <= 0) {
      return;
    }

    var len = msg.length,
      pinNumber = msg[1],
      pinType = msg[2],
      pinState,
      pin = this._ioPins[pinNumber];

    if (len > 4) {
      pinState = this.getValueFromTwo7bitBytes(msg[3], msg[4]);
    } else if (len > 3) {
      pinState = msg[3];
    }

    if (pin._type !== pinType) {
      pin.setType(pinType);
      this.managePinListener(pin);
    }

    pin.setState(pinState);

    this._numPinStateRequests--;
    if (this._numPinStateRequests < 0) {
      this._numPinStateRequests = 0;
    }

    this._pinStateEventCenter.emit(pinNumber, pin);

    this.emit(BoardEvent.PIN_STATE_RESPONSE, {
      pin: pin
    });
  };

  proto.toDec = function (ch) {
    ch = ch.substring(0, 1);
    var decVal = ch.charCodeAt(0);
    return decVal;
  };

  proto.managePinListener = function (pin) {
    if (pin._type === Pin.DOUT || pin._type === Pin.AOUT || pin._type === Pin.SERVO) {
      if (!EventEmitter.listenerCount(pin, PinEvent.CHANGE)) {
        pin.on(PinEvent.CHANGE, this._sendOutHandler);
      }
    } else {
      if (EventEmitter.listenerCount(pin, PinEvent.CHANGE)) {
        try {
          pin.removeListener(PinEvent.CHANGE, this._sendOutHandler);
        } catch (e) {
          // Pin had reference to other handler, ignore
          debug("debug: caught pin removeEventListener exception");
        }
      }
    }
  };

  proto.sendAnalogData = function (pin, value) {
    var pwmResolution = this.getDigitalPin(pin).analogWriteResolution;

    value *= pwmResolution;
    value = (value < 0) ? 0 : value;
    value = (value > pwmResolution) ? pwmResolution : value;

    if (pin > 15 || value > Math.pow(2, 14)) {
      this.sendExtendedAnalogData(pin, value);
    } else {
      this.send([ANALOG_MESSAGE | (pin & 0x0F), value & 0x007F, (value >> 7) & 0x007F]);
    }
  };

  proto.sendExtendedAnalogData = function (pin, value) {
    var analogData = [];

    // If > 16 bits
    if (value > Math.pow(2, 16)) {
      throw new Error('error: Extended Analog values > 16 bits are not currently supported by StandardFirmata');
    }

    analogData[0] = START_SYSEX;
    analogData[1] = EXTENDED_ANALOG;
    analogData[2] = pin;
    analogData[3] = value & 0x007F;
    analogData[4] = (value >> 7) & 0x007F; // Up to 14 bits

    // If > 14 bits
    if (value >= Math.pow(2, 14)) {
      analogData[5] = (value >> 14) & 0x007F;
    }

    analogData.push(END_SYSEX);
    this.send(analogData);
  };

  proto.sendDigitalData = function (pin, value) {
    var portNum = Math.floor(pin / 8);

    if (value === Pin.HIGH) {
      // Set the bit
      this._digitalPort[portNum] |= (value << (pin % 8));
    } else if (value === Pin.LOW) {
      // Clear the bit
      this._digitalPort[portNum] &= ~(1 << (pin % 8));
    } else {
      // Should not happen...
      throw new Error('Invalid value passed to sendDigital, value must be 0 or 1.');
    }

    this.sendDigitalPort(portNum, this._digitalPort[portNum]);
  };

  proto.sendServoData = function (pin, value) {
    var servoPin = this.getDigitalPin(pin);

    if (servoPin._type === Pin.SERVO && servoPin.lastValue !== value) {
      this.sendAnalogData(pin, value);
    }
  };

  proto.queryCapabilities = function () {
    this.send([START_SYSEX, CAPABILITY_QUERY, END_SYSEX]);
  };

  proto.queryAnalogMapping = function () {
    this.send([START_SYSEX, ANALOG_MAPPING_QUERY, END_SYSEX]);
  };

  proto.getValueFromTwo7bitBytes = function (lsb, msb) {
    return (msb << 7) | lsb;
  };

  proto.getTransport = function () {
    return this._transport;
  };

  proto.setTransport = function (type) {
    var klass = scope.transport[type],
      trsp;

    if (this._transport instanceof Transport) {
      try {
        this._transport.close();
      } catch (e) {}
      this._transport.removeAllListeners();
      delete this._transport;
    }

    if (klass && (trsp = new klass(this._options)) instanceof Transport) {
      this._transport = trsp;
      trsp.on(TransportEvent.READY, this._readyHandler);
      trsp.on(TransportEvent.MESSAGE, this._messageHandler);
      trsp.on(TransportEvent.ERROR, this._errorHandler);
    }
  };

  proto.reportVersion = function () {
    this.send(REPORT_VERSION);
  };

  proto.reportFirmware = function () {
    this.send([START_SYSEX, REPORT_FIRMWARE, END_SYSEX]);
  };

  proto.enableDigitalPins = function () {
    for (var i = 0; i < this._numPorts; i++) {
      this.sendDigitalPortReporting(i, Pin.ON);
    }
  };

  proto.disableDigitalPins = function () {
    for (var i = 0; i < this._numPorts; i++) {
      this.sendDigitalPortReporting(i, Pin.OFF);
    }
  };

  proto.sendDigitalPortReporting = function (port, mode) {
    this.send([(REPORT_DIGITAL | port), mode]);
  };

  proto.enableAnalogPin = function (pin) {
    this.sendAnalogPinReporting(pin, Pin.ON);
  };

  proto.disableAnalogPin = function (pin) {
    this.sendAnalogPinReporting(pin, Pin.OFF);
  };

  proto.sendAnalogPinReporting = function (pinNumber, mode) {
    this.send([REPORT_ANALOG | pinNumber, mode]);
  };

  proto.setDigitalPinMode = function (pinNumber, mode, silent) {
    this.getDigitalPin(pinNumber).setType(mode);
    this.managePinListener(this.getDigitalPin(pinNumber));

    if (!silent || silent !== true) {
      this.send([SET_PIN_MODE, pinNumber, mode]);
    }
  };

  proto.setAnalogPinMode = function (pinNumber, mode, silent) {
    this.getAnalogPin(pinNumber).setType(mode);

    if (!silent || silent !== true) {
      this.send([SET_PIN_MODE, pinNumber, mode]);
    }
  };

  proto.enablePullUp = function (pinNum) {
    this.sendDigitalData(pinNum, Pin.HIGH);
  };

  proto.getFirmwareName = function () {
    return this._firmwareName;
  };

  proto.getFirmwareVersion = function () {
    return this._firmwareVersion;
  };

  proto.getPinCapabilities = function () {
    var capabilities = [],
      len,
      pinElements,
      pinCapabilities,
      hasCapabilities;

    var modeNames = {
      0: 'input',
      1: 'output',
      2: 'analog',
      3: 'pwm',
      4: 'servo',
      5: 'shift',
      6: 'i2c',
      7: 'onewire',
      8: 'stepper'
    };

    len = this._ioPins.length;
    for (var i = 0; i < len; i++) {
      pinElements = {};
      pinCapabilities = this._ioPins[i]._capabilities;
      hasCapabilities = false;

      for (var mode in pinCapabilities) {
        if (pinCapabilities.hasOwnProperty(mode)) {
          hasCapabilities = true;
          if (mode >= 0) {
            pinElements[modeNames[mode]] = this._ioPins[i]._capabilities[mode];
          }
        }
      }

      if (!hasCapabilities) {
        capabilities[i] = {
          'not available': '0'
        };
      } else {
        capabilities[i] = pinElements;
      }
    }

    return capabilities;
  };

  proto.queryPinState = function (pins, callback) {
    var self = this,
      promises = [],
      cmds = [];

    pins = util.isArray(pins) ? pins : [pins];

    if (typeof callback === 'function') {
      var once = self._pinStateEventCenter.once.bind(self._pinStateEventCenter);

      pins.forEach(function (pin) {
        promises.push(util.promisify(once, function (pin) {
          this.resolve(pin);
        })(pin.number));
      });

      Promise.all(promises).then(function (pins) {
        callback.call(self, pins.length > 1 ? pins : pins[0]);
      });
    }

    pins.forEach(function (pin) {
      cmds = cmds.concat([START_SYSEX, PIN_STATE_QUERY, pin.number, END_SYSEX]);
      self._numPinStateRequests++;
    })

    self.send(cmds);
  };

  proto.sendDigitalPort = function (portNumber, portData) {
    this.send([DIGITAL_MESSAGE | (portNumber & 0x0F), portData & 0x7F, portData >> 7]);
  };

  proto.sendString = function (str) {
    var decValues = [];
    for (var i = 0, len = str.length; i < len; i++) {
      decValues.push(this.toDec(str[i]) & 0x007F);
      decValues.push((this.toDec(str[i]) >> 7) & 0x007F);
    }
    this.sendSysex(STRING_DATA, decValues);
  };

  proto.sendSysex = function (command, data) {
    var sysexData = [];
    sysexData[0] = START_SYSEX;
    sysexData[1] = command;
    for (var i = 0, len = data.length; i < len; i++) {
      sysexData.push(data[i]);
    }
    sysexData.push(END_SYSEX);
    this.send(sysexData);
  };

  proto.sendServoAttach = function (pin, minPulse, maxPulse) {
    var servoPin,
      servoData = [];

    minPulse = minPulse || 544; // Default value = 544
    maxPulse = maxPulse || 2400; // Default value = 2400

    servoData[0] = START_SYSEX;
    servoData[1] = SERVO_CONFIG;
    servoData[2] = pin;
    servoData[3] = minPulse % 128;
    servoData[4] = minPulse >> 7;
    servoData[5] = maxPulse % 128;
    servoData[6] = maxPulse >> 7;
    servoData[7] = END_SYSEX;

    this.send(servoData);

    servoPin = this.getDigitalPin(pin);
    servoPin.setType(Pin.SERVO);
    this.managePinListener(servoPin);
  };

  proto.getPin = function (pinNumber) {
    return this._ioPins[pinNumber];
  };

  proto.getAnalogPin = function (pinNumber) {
    return this._ioPins[this._analogPinMapping[pinNumber]];
  };

  proto.getDigitalPin = function (pinNumber) {
    return this._ioPins[this._digitalPinMapping[pinNumber]];
  };

  proto.getPins = function () {
    return this._ioPins;
  };

  proto.analogToDigital = function (analogPinNumber) {
    return this.getAnalogPin(analogPinNumber).number;
  };

  proto.getPinCount = function () {
    return this._totalPins;
  };

  proto.getAnalogPinCount = function () {
    return this._totalAnalogPins;
  };

  proto.getI2cPins = function () {
    return this._i2cPins;
  };

  proto.reportCapabilities = function () {
    var capabilities = this.getPinCapabilities(),
      len = capabilities.length,
      resolution;

    for (var i = 0; i < len; i++) {
      debug('Pin ' + i + ':');
      for (var mode in capabilities[i]) {
        if (capabilities[i].hasOwnProperty(mode)) {
          resolution = capabilities[i][mode];
          debug('\t' + mode + ' (' + resolution + (resolution > 1 ? ' bits)' : ' bit)'));
        }
      }
    }
  };

  proto.send = function (data) {
    this._transport.send(data);
  };

  proto.close = function () {
    this._transport.close();
  };

  scope.BoardEvent = BoardEvent;
  scope.Board = Board;
}));
