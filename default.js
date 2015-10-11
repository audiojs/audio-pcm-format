/**
 * Default input/output format
 *
 * @module audio-pcm-format/default
 */
module.exports = {
	channels: 2,
	sampleRate: 44100,
	byteOrder: 'LE',
	bitDepth: 16,
	signed: true,
	float: false,
	interleaved: true,
	samplesPerFrame: undefined
};