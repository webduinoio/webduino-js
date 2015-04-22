var Firebase = require('firebase'),
  webduino = require('../../'),
  board,
  dht;

board = new webduino.WebArduino('device_id');

board.on(webduino.BoardEvent.READY, function () {
  dht = new webduino.module.Dht(board, board.getDigitalPin(11));
  dht.read(function (data) {
    data.timestamp = new Date().getTime();
    console.log(data);
    writeData(data);
  }, 60000);
});

board.on(webduino.BoardEvent.ERROR, function (error) {
  console.log(error);
});

function writeData(data) {
  var dhtRef = new Firebase("https://glowing-fire-4998.firebaseio.com/dht");
  var newDataRef = dhtRef.push();
  newDataRef.set(data);
}
