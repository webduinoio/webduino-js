var webduino = require('./src/webduino');

require('./src/core/EventEmitter')(webduino);
require('./src/core/util')(webduino);
require('./src/util/promisify')(webduino);
require('./src/core/Transport')(webduino);
require('./src/transport/MqttNodeTransport')(webduino);
require('./src/core/Pin')(webduino);
require('./src/core/Module')(webduino);
require('./src/core/Board')(webduino);
require('./src/core/WebArduino')(webduino);

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

module.exports = webduino;
