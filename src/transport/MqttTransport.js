+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var Transport = scope.Transport,
    TransportEvent = scope.TransportEvent,
    proto;

  var STATUS = {
    OK: 'OK'
  };

  var TOPIC = {
    PING: '/PING',
    PONG: '/PONG',
    STATUS: '/STATUS'
  };

  function MqttTransport(options) {
    Transport.call(this, options);

    this._options = options;
    this._clientId = '_' + new Date().getTime();
    this._client = null;
    this._timer = null;
    this._reconnTime = 0;
    this._status = '';
    this._buf = [];
    this._isReady = false;

    this._connHandler = onConnect.bind(this);
    this._messageHandler = onMessage.bind(this);
    this._disconnHandler = onDisconnect.bind(this);
    this._errorHandler = onError.bind(this);

    init(this);
  }

  function init(self) {
    self._client = new Paho.MQTT.Client(self._options.url, self._clientId);
    self._client.onMessageArrived = self._messageHandler;
    self._client.onConnectionLost = self._disconnHandler;
    self._client.connect({
      userName: self._options.login || '',
      password: self._options.password || '',
      timeout: MqttTransport.CONNECT_TIMEOUT,
      keepAliveInterval: MqttTransport.KEEPALIVE_INTERVAL,
      onSuccess: self._connHandler,
      onFailure: self._errorHandler
    });
  }

  function onConnect() {
    stopReconnect(this);
    this._isReady = true;
    this._reconnTime = 0;

    this.emit(TransportEvent.OPEN);
    this._client.subscribe(this._options.device + TOPIC.PONG);
    this._client.subscribe(this._options.device + TOPIC.STATUS);
  }

  function onMessage(message) {
    var dest = message.destinationName,
      oldStatus = this._status;

    switch (dest.substr(dest.lastIndexOf('/') + 1)) {
    case 'STATUS':
      this._status = message.payloadString;
      detectStatusChange(this, this._status, oldStatus);
      break;
    default:
      this.emit(TransportEvent.MESSAGE, message.payloadBytes);
      break;
    }
  }

  function detectStatusChange(self, newStatus, oldStatus) {
    if (newStatus === oldStatus) {
      return;
    }

    if (newStatus === STATUS.OK) {
      self.emit(TransportEvent.READY);
    } else {
      self.emit(TransportEvent.ERROR, new Error('error: board connection failed. (1)'));
    }
  }

  function onDisconnect(respObj) {
    this.emit(TransportEvent.ERROR, new Error(
      respObj.errorCode ? respObj.errorMessage : 'error: board connection failed. (2)'
    ));

    if (this._isReady) {
      this._isReady = false;
      this.emit(TransportEvent.CLOSE);
      startReconnect(this);
    }
  }

  function onError(respObj) {
    this.emit(TransportEvent.ERROR, new Error(respObj.errorMessage));

    if (!this._isReady) {
      startReconnect(this);
    }
  }

  function startReconnect(self) {
    stopReconnect(self);
    self.close();
    self._timer = setTimeout(function () {
      self._reconnTime += MqttTransport.RECONNECT_PERIOD * 1000;
      if (self._reconnTime < MqttTransport.CONNECT_TIMEOUT * 1000) {
        init(self);
      }
    }, MqttTransport.RECONNECT_PERIOD * 1000);
  }

  function stopReconnect(self) {
    if (self._timer) {
      clearTimeout(self._timer);
      delete(self._timer);
    }
  }

  MqttTransport.prototype = proto = Object.create(Transport.prototype, {

    constructor: {
      value: MqttTransport
    },

    isReady: {
      get: function () {
        return this._isReady;
      }
    }

  });

  proto.send = function (payload) {
    this._buf = new Uint8Array(payload.length ? payload : [payload]);
    payload = new Paho.MQTT.Message(this._buf);
    payload.destinationName = this._options.device + TOPIC.PING;
    payload.qos = 0;
    this._client.send(payload);
  };

  proto.close = function () {
    if (this._isReady) {
      this._client.disconnect();
    }
    delete this._client;
  };

  MqttTransport.RECONNECT_PERIOD = 5;

  MqttTransport.KEEPALIVE_INTERVAL = 30;

  MqttTransport.CONNECT_TIMEOUT = 60;

  scope.transport.mqtt = MqttTransport;
}));
