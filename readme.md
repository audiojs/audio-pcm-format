Transform PCM audio stream format:

* Remap channels, e.g. swap left to right or map mono to stereo.
* Resample, e. g. `88200` → `44100`.
* Change single sample format, e. g. `Int16BE` to `FloatLE`.
* Change [order of samples](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API#Planar_versus_interleaved_buffers) from interleaved to planar, e. g. `LLLLRRRR` → `LRLRLRLR`.


[`npm install audio-pcm-format`](https://npmjs.org/package/audio-pcm-format)


```js
var PcmFormat = require('audio-pcm-format');
var Speaker = require('node-speaker');


/** Transform input format to optional output format. If format is omitted - default one is used */
PcmFormat(inputFormat, outputFormat?).pipe(Speaker());


/** Default output/input format, extended with passed formats */
PcmFormat.default === {
	//number and order of output channels
	//pass an array [0, 1] with input channel numbers to map in a custom way
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


## Related

* [pcm-format](https://npmjs.org/package/pcm-format) — transforms pcm stream per sample.