var webduino = require('../..'),
  board,
  led;

board = new webduino.Arduino('/dev/cu.usbmodem1421');

board.on(webduino.BoardEvent.READY, function () {
  led = new webduino.module.Led(board, board.getDigitalPin(13));
  led.on();
});
