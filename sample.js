/**
 * Convert sample from format A to format B
 * @module audio-pcm-format/sample
 */

module.exports = function (value, from, to) {
	//normalize value to float form -1..1
	if (!from.float) {

		var maxInt = Math.pow(2, from.bitDepth-1);

		if (!from.signed) {
			value -= maxInt;
		}
		value /= maxInt;
	}

	//convert value to needed form
	if (!to.float) {
		var maxInt = Math.pow(2, to.bitDepth-1);

		if (to.signed) {
			value = value * (maxInt - 1);
		} else {
			value = (value + 1) * maxInt;
		}
		value = Math.floor(value);
	}

	return value;
}