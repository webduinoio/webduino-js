+(function (scope) {
  'use strict';

  var push = Array.prototype.push,
    serial = chrome.serial;

  var Transport = scope.Transport,
    TransportEvent = scope.TransportEvent,
    proto;

  function SerialTransport(options) {
    Transport.call(this, options);

    this._options = options;
    this._connectionId = null;
    this._sendTimer = null;
    this._buf = [];

    this._connHandler = onConnect.bind(this);
    this._messageHandler = onMessage.bind(this);
    this._sendOutHandler = sendOut.bind(this);
    this._disconnHandler = onDisconnect.bind(this);
    this._errorHandler = onError.bind(this);
    this._beforeUnloadHandler = this.close.bind(this);

    init(this);
  }

  function init(self) {
    var options = self._options;
    serial.connect(options.path, {
      bitrate: options.baudRate
    }, self._connHandler);
  }

  function onConnect(connectionInfo) {
    this.emit(TransportEvent.OPEN);
    window.addEventListener('beforeunload', this._beforeUnloadHandler);
    serial.onReceive.addListener(this._messageHandler);
    serial.onReceiveError.addListener(this._errorHandler);
    this._connectionId = connectionInfo.connectionId;
    this.emit(TransportEvent.READY);
  }

  function onMessage(message) {
    if (message.connectionId === this._connectionId) {
      this.emit(TransportEvent.MESSAGE, message.data);
    }
  }

  function onDisconnect(result) {
    delete this._connectionId;
    window.removeEventListener('beforeunload', this._beforeUnloadHandler);
    serial.onReceive.removeListener(this._messageHandler);
    serial.onReceiveError.removeListener(this._errorHandler);
    this.emit(TransportEvent.CLOSE);
  }

  function onError(info) {
    this.emit(TransportEvent.ERROR, new Error(JSON.stringify(info)));
  }

  function sendOut() {
    var payload = new Uint8Array(this._buf).buffer;
    serial.send(this._connectionId, payload);
    clearBuf(this);
  }

  function clearBuf(self) {
    self._buf = [];
    clearImmediate(self._sendTimer);
    self._sendTimer = null;
  }

  SerialTransport.prototype = proto = Object.create(Transport.prototype, {

    constructor: {
      value: SerialTransport
    },

    isReady: {
      get: function () {
        return !!this._connectionId;
      }
    }

  });

  proto.send = function (payload) {
    push.apply(this._buf, payload);
    if (!this._sendTimer) {
      this._sendTimer = setImmediate(this._sendOutHandler);
    }
  };

  proto.close = function () {
    if (this.isReady) {
      serial.disconnect(this._connectionId, this._disconnHandler);
    }
  };

  scope.transport.serial = SerialTransport;
}(webduino || {}));
