const { src, dest, watch, series, parallel } = require('gulp');
const expect = require('gulp-expect-file');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const shell = require('gulp-shell');

const SOURCE_DIR = 'src';
const DIST_DIR = 'dist';
const base = [
  '../setimmediate/setImmediate.js',
  '../paho/src/mqttws31.js',
  'src/webduino.js',
  'src/core/Logger.js',
  'src/core/EventEmitter.js',
  'src/core/util.js',
  'src/util/promisify.js',
  'src/core/Transport.js',
  'src/transport/MqttTransport.js',
  'src/transport/WebSocketTransport.js',
  'src/core/Pin.js',
  'src/core/Module.js',
  'src/core/Board.js',
  'src/core/WebArduino.js',
  'src/core/Arduino.js',
  '../chrome-api-proxy/lib/chrome._api.js',
  '../chrome-api-proxy/lib/chrome.serial.js',
  '../webduino-serial-transport/src/SerialTransport.js',
  '../chrome-api-proxy/lib/chrome.bluetooth.js',
  '../webduino-bluetooth-transport/src/BluetoothTransport.js'
];
const boards = [
  'src/board/Smart.js',
  'src/board/Bit.js'
];
const modules = [
  'src/module/DataTransfer.js',
  'src/module/IRRAW.js',
  'src/module/DFPlayer.js',
  'src/module/LCD1602.js',
  'src/module/Led.js',
  'src/module/RGBLed.js',
  'src/module/Button.js',
  'src/module/Ultrasonic.js',
  'src/module/Servo.js',
  'src/module/Tilt.js',
  'src/module/Pir.js',
  'src/module/Shock.js',
  'src/module/Sound.js',
  'src/module/Relay.js',
  'src/module/Dht.js',
  'src/module/Buzzer.js',
  'src/module/Max7219.js',
  'src/module/ADXL345.js',
  'src/module/HX711.js',
  'src/module/SSD1306.js',
  'src/module/Barcode.js',
  'src/module/IRLed.js',
  'src/module/IRRecv.js',
  'src/module/Joystick.js',
  'src/module/MQ2.js',
  'src/module/Photocell.js',
  'src/module/Pot.js',
  'src/module/RFID.js',
  'src/module/Soil.js',
  'src/module/G3.js',
  'src/module/Stepper.js'
];

function expectFiles(ary) {
  return src(ary).pipe(expect(ary));
}

function clean() {
  return shell.task([
    `rm -rf ${DIST_DIR} docs`
  ])();
}

function docs() {
  return shell.task([
    'npm install --no-save yuidocjs yuidoc-lucid-theme',
    './node_modules/.bin/yuidoc -c yuidoc.json ./src'
  ])();
}

function webduinoBaseJS() {
  return expectFiles(base)
    .pipe(concat('webduino-base.js'))
    .pipe(dest(DIST_DIR));
}

function webduinoBaseMinJS() {
  return expectFiles(base)
    .pipe(concat('webduino-base.min.js'))
    .pipe(uglify())
    .pipe(dest(DIST_DIR));
}

function webduinoAllJS() {
  return expectFiles(base.concat(boards).concat(modules))
    .pipe(concat('webduino-all.js'))
    .pipe(dest(DIST_DIR));
}

function webduinoAllMinJS() {
  return expectFiles(base.concat(boards).concat(modules))
    .pipe(concat('webduino-all.min.js'))
    .pipe(uglify())
    .pipe(dest(DIST_DIR));
}

function watchFiles() {
  watch(SOURCE_DIR + '/**/*.js', series(clean, dev));
}

const dev = series(webduinoBaseJS, webduinoAllJS);

const prod = series(webduinoBaseMinJS, webduinoAllMinJS);

exports.watch = watchFiles;
exports.default = series(clean, parallel(docs, dev, prod));
