var webduino = require('./src/webduino');

require('setimmediate');

require('./src/core/EventEmitter')(webduino);
require('./src/core/util')(webduino);
require('./src/util/promisify')(webduino);
require('./src/core/Transport')(webduino);
require('./src/transport/NodeMqttTransport')(webduino);
require('./src/transport/NodeSerialTransport')(webduino);
require('./src/transport/NodeBluetoothTransport')(webduino);
require('./src/core/Pin')(webduino);
require('./src/core/Module')(webduino);
require('./src/core/Board')(webduino);
require('./src/core/WebArduino')(webduino);
require('./src/core/Arduino')(webduino);

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
require('./src/module/IRLed')(webduino);
require('./src/module/IRRecv')(webduino);
require('./src/module/Joystick')(webduino);
require('./src/module/MQ2')(webduino);
require('./src/module/Photocell')(webduino);
require('./src/module/Pot')(webduino);

module.exports = webduino;
