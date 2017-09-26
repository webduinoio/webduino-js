# webduino-js
The Webduino Javascript Core, for Browser and Node.js

## Installation
#### Browser
Using [bower](http://bower.io):
```sh
$ bower install webduino-js#dist
```

Insert scripts:
```html
<script src="bower_components/webduino-js/dist/webduino-base.js"></script>
<script src="bower_components/webduino-js/src/module/Led.js"></script>
... (modules used)
```

Or all-in-one:
```html
<script src="bower_components/webduino-js/dist/webduino-all.js"></script>
```

#### Node.js
```sh
$ npm install webduino-js
```

## Usage
**webduino-js** provides isomorphic APIs:

```javascript
var webduino = require('webduino-js');

var board, led;

board = new webduino.WebArduino('device_id');

board.on('ready', function() {
  led = new webduino.module.Led(board, board.getDigitalPin(10));
  led.on();
});
```

## Transports
**webduino-js** talks to Webduino Dev Board via MQTT by default. However, since **webduino-js** speaks [Firmata](https://www.arduino.cc/en/Reference/Firmata), we can also _directly_ talk to standard Arduino or any dev board that understands firmata.

Currently we have transports supporting USB serial port and Bluetooth (HC-06 tested) communications: _(Note: you have to install Firmata library first)_

* [webduino-serial-transport](https://github.com/webduinoio/webduino-serial-transport)
* [webduino-bluetooth-transport](https://github.com/webduinoio/webduino-bluetooth-transport)

## See Also
* [Webduino Dev Board and Webduino Dev Kit](https://webduino.io)
* [The Firmata Protocol](https://github.com/firmata/protocol)
* [Arduino Firmata Installation](http://www.instructables.com/id/Arduino-Installing-Standard-Firmata)

## License
[MIT](LICENSE)
