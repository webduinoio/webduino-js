'use strict';

var webduino = require('../..'),
  board,
  led;

board = new webduino.WebArduino('device_id');

// board = new webduino.WebArduino({
//   'transport': 'serial',
//   'baudRate': 57600,
//   'path': '/dev/cu.usbmodem1411'
// });

// board = new webduino.Arduino({
//   'transport': 'serial',
//   'path': '/dev/cu.usbmodem1421'
// });

// board = new webduino.Arduino({
//   'transport': 'bluetooth',
//   'address': '30:14:09:30:15:67'
// });

// board = new webduino.Arduino({
//   'transport': 'mqtt',
//   'device': '',
//   'server': 'wss://ws.webduino.io:443/',
//   'login': 'admin',
//   'password': 'password'
// });

// board = new webduino.Arduino({
//   'transport': 'websocket',
//   'url': 'wa1501.local'
// });

board.on(webduino.BoardEvent.READY, function () {
  led = new webduino.module.Led(board, board.getDigitalPin(10));
  led.blink(500);

  setTimeout(function () {
    board.close();
  }, 5000);
});

board.on(webduino.BoardEvent.ERROR, function (err) {
  console.log('board error', err.message);
});

board.on(webduino.BoardEvent.BEFOREDISCONNECT, function () {
  console.log('board beforedisconnect');
});

board.on(webduino.BoardEvent.DISCONNECT, function () {
  console.log('board disconnect');
  // test: should not emit 'disconnect' again
  board.disconnect();
});
