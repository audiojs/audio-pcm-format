/**
 * @module audio-pcm-format
 */


var inherits = require('inherits');
var Transform = require('stream').Transform;
var PassThrough = require('stream').PassThrough;
var extend = require('xtend/mutable');
var convertSample = require('./sample');


/** @constructor */
function PCMFormat (input, output) {
	if (!(this instanceof PCMFormat)) return new PCMFormat(input, output);

	Transform.call(this);

	//save input format
	this.input = extend({}, PCMFormat.default, input);
	this.output = extend({}, PCMFormat.default, output);

	//if input format === output format - return passthrough stream
	var eq = true;
	for (var key in this.input) {
		if (this.input[key] !== this.output[key]) {
			eq = false;
			break;
		}
	}
	if (eq) return new PassThrough();

	//precalc
	if (this.input.float) {
		this.input.bitDepth = 32;
		this.input.signed = true;
	}
	if (this.output.float) {
		this.output.bitDepth = 32;
		this.output.signed = true;
	}
	this.input.sampleSize = this.input.bitDepth / 8;
	this.output.sampleSize = this.output.bitDepth / 8;

	this.input.method = 'read' + PCMFormat.getMethodSuffix(this.input);
	this.output.method = 'write' + PCMFormat.getMethodSuffix(this.output);

	this.input.channels = PCMFormat.getChannelsMap(this.input.channels);
	this.output.channels = PCMFormat.getChannelsMap(this.output.channels);

	//normalized data for output channels
	this.data = this.output.channels.map(function () {return []});
}

inherits(PCMFormat, Transform);


PCMFormat.prototype._transform = function (inputChunk, enc, cb) {
	var self = this;
	var input = self.input, output = self.output, data = self.data;
	var value, channel, offset, channels;

	var inputFrameLength = inputChunk.length / input.sampleSize / input.channels.length;
	var outputFrameLength = output.samplesPerFrame || inputFrameLength;

	var sampleRateRatio = input.sampleRate / output.sampleRate;


	//bring value to normalized form
	channels = input.channels;
	for (var i = 0; i < inputFrameLength; i++) {
		for (var cIdx = 0; cIdx < channels.length; cIdx++) {
			channel = channels[cIdx];
			offset = (input.interleaved ? channel + i * channels.length : channel * inputFrameLength + i) * input.sampleSize;
			value = inputChunk[input.method](offset);

			//put recalculated value to the proper channel
			data[channel].push(convertSample(value, input, output));
		}
	}


	//if there is enough data - send chunk
	channels = output.channels;

	if (!output.samplesPerFrame || (output.samplesPerFrame && self.data[channel].length > output.samplesPerFrame)) {
		var outputChunkSize = outputFrameLength * output.sampleSize * channels.length;
		var outputChunk = new Buffer(outputChunkSize);

		//write sample
		for (var i = 0; i < outputFrameLength; i++) {
			for (var cIdx = 0; cIdx < channels.length; cIdx++) {
				channel = channels[cIdx];

				//pick resampled value
				value = data[channel][Math.round(i * sampleRateRatio)];

				//write value to proper position
				offset = (output.interleaved ? channel + i * channels.length : channel * outputFrameLength + i) * output.sampleSize;

				outputChunk[output.method](value, offset);
			}
		}

		//shorten inner data on the input frame size, inc sample rate
		self.data = self.data.map(function (data) {
			return data.slice(Math.round(outputFrameLength * sampleRateRatio));
		});

		cb(null, outputChunk);
	}
};


/** Generate method postfix based on  */
PCMFormat.getMethodSuffix = function (format) {
	return (format.float ? 'Float' : ((format.signed ? '' : 'U') + 'Int' + format.bitDepth)) + format.byteOrder;
};

/** Generate channels array from number of channels */
PCMFormat.getChannelsMap = function (n) {
	if (!Array.isArray(n)) {
		var result = [];
		for (var i = 0; i < n; i++) {
			result[i] = i;
		}
	}
	return result;
}


/** Default PCM settings */
PCMFormat.default = {
	channels: 2,
	sampleRate: 44100,
	byteOrder: 'LE',
	bitDepth: 16,
	signed: true,
	float: false,
	interleaved: true,
	samplesPerFrame: undefined
};


/** Export utils */
PCMFormat.sample = convertSample;
PCMFormat.frame = convertFrame;


module.exports = PCMFormat;