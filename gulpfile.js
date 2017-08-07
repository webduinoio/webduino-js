var gulp = require('gulp'),
  expect = require('gulp-expect-file'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  shell = require('gulp-shell');

function expectFiles(ary) {
  return gulp.src(ary).pipe(expect(ary));
}

var base = [
    '../setimmediate/setImmediate.js',
    '../paho/src/mqttws31.js',
    'src/webduino.js',
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
  ],
  boards = [
    'src/board/Smart.js'
  ],
  modules = [
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

gulp.task('clean', shell.task([
  'rm -rf dist docs'
]));

gulp.task('docs', ['clean'], shell.task([
  './node_modules/.bin/yuidoc -c yuidoc.json ./src'
]));

gulp.task('dev', ['clean'], function () {
  expectFiles(base)
    .pipe(concat('webduino-base.js'))
    .pipe(gulp.dest('dist'));
  expectFiles(base.concat(boards).concat(modules))
    .pipe(concat('webduino-all.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('prod', ['clean'], function () {
  expectFiles(base)
    .pipe(concat('webduino-base.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
  expectFiles(base.concat(boards).concat(modules))
    .pipe(concat('webduino-all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['docs', 'dev', 'prod']);
