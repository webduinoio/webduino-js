# webduino-js

The Webduino javascript core, for browser and node.js

## Installation

#### Browser

```Shell
$ bower install webduino-js
```

For dist files and docs:

```Shell
$ cd bower_components/webduino-js
$ npm install && npm run build
```

#### Node.js

```Shell
$ npm install webduino-js
```

## Usage

#### Browser

Insert scripts in your html:

```
<script src="bower_components/webduino-js/dist/webduino-base.min.js"></script>
<script src="bower_components/webduino-js/src/module/Led.js"></script>
```

#### Node.js

Require the module:

```javascript
var webduino = require('webduino-js');
```

Then use it with the same APIs:

```javascript
var board, led;

board = new webduino.WebArduino('device_id');

board.on(webduino.BoardEvent.READY, function() {
	led = new webduino.module.Led(board, board.getDigitalPin(10));
	led.on();
});
```

## API

_(coming soon...)_

## [License](LICENSE)