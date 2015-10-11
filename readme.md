[![npm install audio-pcm-format](https://nodei.co/npm/audio-pcm-format.png?mini=true)](https://npmjs.org/package/audio-pcm-format/)

```js
var PcmFormat = require('audio-pcm-format');
var Speaker = require('node-speaker');


/** Transform input format to optional output format */
PcmFormat(inputFormat, outputFormat?).pipe(Speaker());


/** Default output/input format, extended with passed formats */
PcmFormat.default === {
	//number and order of output channels
	//pass an array [0, 1] with input channel numbers to remap in a custom way
	channels: 2,

	//single sample params
	byteOrder: 'LE',
	bitDepth: 16,
	signed: true,
	float: false,

	//resample
	sampleRate: 44100,

	//the way to read/write input/output samples: [LRLRLRLR] or [LLLLRRRR]
	interleaved: true,

	//force output chunks size
	samplesPerFrame: undefined
}


/** Return buffer method suffix based on format, e.g. 'Int16LE', or 'FloatLE' */
PcmFormat.getMethodSuffix(format);
```

* [pcm-format](https://npmjs.org/package/pcm-format) — transforms pcm stream per sample.