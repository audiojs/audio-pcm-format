/**
 * Return buffer method suffix for the format
 *
 * @module audio-pcm-format
 */
module.exports = function (format) {
	return (format.float ? 'Float' : ((format.signed ? '' : 'U') + 'Int' + format.bitDepth)) + format.byteOrder;
};