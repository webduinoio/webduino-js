var gulp = require('gulp'),
  expect = require('gulp-expect-file'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  shell = require('gulp-shell');

function expectFiles(ary) {
  return gulp.src(ary).pipe(expect(ary));
}

var base = [
    '../paho/src/mqttws31.js',
    'src/webduino.js',
    'src/core/EventEmitter.js',
    'src/core/util.js',
    'src/util/promisify.js',
    'src/core/Transport.js',
    'src/transport/MqttTransport.js',
    'src/core/Pin.js',
    'src/core/Module.js',
    'src/core/Board.js',
    'src/core/WebArduino.js'
  ],
  modules = [
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
    'src/module/Buzzer.js'
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
  expectFiles(base.concat(modules))
    .pipe(concat('webduino-all.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('prod', ['clean'], function () {
  expectFiles(base)
    .pipe(concat('webduino-base.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
  expectFiles(base.concat(modules))
    .pipe(concat('webduino-all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['docs', 'dev', 'prod']);
