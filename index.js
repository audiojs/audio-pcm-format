/**
 * @module audio-transform
 */

var inherits = require('inherits');
var Transform = require('stream').Transform;
var PassThrough = require('stream').PassThrough;
var extend = require('xtend/mutable');


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
	this.input.sampleSize = this.input.bitDepth / 8;
	this.output.sampleSize = this.output.bitDepth / 8;

	this.input.maxInt = Math.pow(2, this.input.bitDepth-1);
	this.output.maxInt = Math.pow(2, this.output.bitDepth-1);

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
			offset = input.interleaved ? channel + i * channels.length : channel * inputFrameLength + i;
			value = inputChunk[input.method](offset);

			//normalize value to float form -1..1
			if (!input.float) {
				if (!input.signed) {
					value -= input.maxInt;
				}
				value /= input.maxInt;
			}

			//put value to the proper channel
			data[channel].push(value);
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

				//convert value to needed form
				if (!output.float) {
					value *= output.maxInt;
					if (!output.signed) {
						value += output.maxInt;
					}
				}

				//write value to proper position
				offset = output.interleaved ? channel + i * channels.length : channel * outputFrameLength + i;

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
		var l = n.length;
		n = [];
		for (var i = 0; i < l; i++) {
			n[i] = i;
		}
	}
	return n;
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