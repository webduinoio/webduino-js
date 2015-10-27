+(function (scope) {
  'use strict';

  var push = Array.prototype.push,
    bluetooth = chrome.bluetoothSocket;

  var Transport = scope.Transport,
    TransportEvent = scope.TransportEvent,
    proto;

  function BluetoothTransport(options) {
    Transport.call(this, options);

    this._options = options;
    this._socketId = null;
    this._sendTimer = null;
    this._buf = [];

    this._messageHandler = onMessage.bind(this);
    this._sendOutHandler = sendOut.bind(this);
    this._disconnHandler = onDisconnect.bind(this);
    this._errorHandler = onError.bind(this);
    this._beforeUnloadHandler = this.close.bind(this);

    init(this);
  }

  function init(self) {
    var options = self._options;
    getSocketId(options.address, function (socketId) {
      if (!socketId) {
        self.emit(TransportEvent.ERROR, new Error('error: no device found'));
      } else {
        window.addEventListener('beforeunload', self._beforeUnloadHandler);
        bluetooth.onReceive.addListener(self._messageHandler);
        bluetooth.onReceiveError.addListener(self._errorHandler);
        bluetooth.connect(socketId, options.address, options.uuid, function () {
          self._socketId = socketId;
          self.emit(TransportEvent.OPEN);
        });
      }
    });
  }

  function getSocketId(address, callback) {
    var uuids, connectedId;

    chrome.bluetooth.getDevice(address, function (devInfo) {
      if (devInfo) {
        uuids = devInfo.uuids;
        bluetooth.getSockets(function (sks) {
          sks.some(function (skt) {
            if (uuids.indexOf(skt.uuid) !== -1) {
              connectedId = skt.socketId;
              return true;
            }
          });
          if (typeof connectedId === 'undefined') {
            bluetooth.create(function (createInfo) {
              callback(createInfo.socketId);
            });
          } else {
            bluetooth.getInfo(connectedId, function (sktInfo) {
              if (sktInfo.connected) {
                bluetooth.disconnect(sktInfo.socketId, function () {
                  callback(sktInfo.socketId);
                });
              } else {
                callback(sktInfo.socketId);
              }
            });
          }
        });
      } else {
        callback(null);
      }
    });
  }

  function onMessage(message) {
    if (message.socketId === this._socketId) {
      this.emit(TransportEvent.MESSAGE, message.data);
    }
  }

  function onDisconnect() {
    window.removeEventListener('beforeunload', this._beforeUnloadHandler);
    bluetooth.onReceive.removeListener(this._messageHandler);
    bluetooth.onReceiveError.removeListener(this._errorHandler);
    delete this._socketId;
    this.emit(TransportEvent.CLOSE);
  }

  function onError(info) {
    this.emit(TransportEvent.ERROR, new Error(JSON.stringify(info)));
  }

  function sendOut() {
    var payload = new Uint8Array(this._buf).buffer;
    bluetooth.send(this._socketId, payload);
    clearBuf(this);
  }

  function clearBuf(self) {
    self._buf = [];
    clearImmediate(self._sendTimer);
    self._sendTimer = null;
  }

  BluetoothTransport.prototype = proto = Object.create(Transport.prototype, {

    constructor: {
      value: BluetoothTransport
    },

    isOpen: {
      get: function () {
        return !!this._socketId;
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
    if (this.isOpen) {
      bluetooth.close(this._socketId, this._disconnHandler);
    }
  };

  scope.transport.bluetooth = BluetoothTransport;
}(webduino || {}));
