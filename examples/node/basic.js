var webduino = require('../..'),
  board,
  led;

board = new webduino.WebArduino('device_id');

board.on(webduino.BoardEvent.READY, function () {
  led = new webduino.module.Led(board, board.getDigitalPin(10));
  led.on();
});
