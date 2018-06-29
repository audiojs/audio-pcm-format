[![npm install audio-pcm-format](https://nodei.co/npm/audio-pcm-format.png?mini=true)](https://npmjs.org/package/audio-pcm-format/)

```js
var PcmFormat = require('audio-pcm-format');
var Speaker = require('node-speaker');


/** Transform input format to output format */
myStream.pipe(PcmFormat(inputFormat, outputFormat?)).pipe(Speaker());


/** Default output/input format, extended with passed formats. Redefine if needed. */
PcmFormat.default === {
	//number or order of channels, if array, e. g. [0, 1] → [1, 0]
	channels: 2,

	//single sample params
	byteOrder: 'LE',
	bitDepth: 16,
	signed: true,
	float: false,

	//the way to read/write input/output samples: [LRLRLRLR] or [LLLLRRRR]
	interleaved: true,

	//force output chunk size
	samplesPerFrame: undefined
};


```

> **Related**<br/>
> [pcm-util](https://npmjs.org/package/pcm-util) — utils for pcm transforms.<br/>
> [pcm-format](https://npmjs.org/package/pcm-format) — transforms pcm stream per sample.<br/>

[![Greenkeeper badge](https://badges.greenkeeper.io/audiojs/audio-pcm-format.svg)](https://greenkeeper.io/)