var webduino = require('./src/webduino');

require('setimmediate');

require('./src/core/EventEmitter')(webduino);
require('./src/core/util')(webduino);
require('./src/util/promisify')(webduino);
require('./src/core/Transport')(webduino);
require('./src/core/Pin')(webduino);
require('./src/core/Module')(webduino);
require('./src/core/Board')(webduino);
require('./src/core/WebArduino')(webduino);
require('./src/core/Arduino')(webduino);

require('./src/board/Smart')(webduino);

require('./src/module/DataTransfer')(webduino);
require('./src/module/IRRAW')(webduino);
require('./src/module/DFPlayer')(webduino);
require('./src/module/LCD1602')(webduino);
require('./src/module/Led')(webduino);
require('./src/module/RGBLed')(webduino);
require('./src/module/Button')(webduino);
require('./src/module/Ultrasonic')(webduino);
require('./src/module/Servo')(webduino);
require('./src/module/Tilt')(webduino);
require('./src/module/Pir')(webduino);
require('./src/module/Shock')(webduino);
require('./src/module/Sound')(webduino);
require('./src/module/Relay')(webduino);
require('./src/module/Dht')(webduino);
require('./src/module/Buzzer')(webduino);
require('./src/module/Max7219')(webduino);
require('./src/module/ADXL345')(webduino);
require('./src/module/HX711')(webduino);
require('./src/module/SSD1306')(webduino);
require('./src/module/Barcode')(webduino);
require('./src/module/IRLed')(webduino);
require('./src/module/IRRecv')(webduino);
require('./src/module/Joystick')(webduino);
require('./src/module/MQ2')(webduino);
require('./src/module/Photocell')(webduino);
require('./src/module/Pot')(webduino);
require('./src/module/RFID')(webduino);
require('./src/module/Soil')(webduino);
require('./src/module/G3')(webduino);
require('./src/module/Stepper')(webduino);

module.exports = webduino;

webduino.transport.mqtt = require('./src/transport/NodeMqttTransport');
webduino.transport.websocket = require('./src/transport/NodeWebSocketTransport');
findTransport('serial', 'webduino-serial-transport');
findTransport('bluetooth', 'webduino-bluetooth-transport');

function findTransport(type, name) {
  try {
    if (require.resolve(name)) {
      webduino.transport[type] = require(name);
    }
  } catch (e) {}
}
