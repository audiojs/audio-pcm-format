var PcmFormat = require('./');
var assert = require('assert');

describe('Sample format', function () {
	it('FloatLE → Int16BE', function (cb) {
		var trans = new PcmFormat(
			{ float: true },
			{ float: false, signed: true, bitDepth: 16, byteOrder: 'BE' }
		);

		var buf = new Buffer(8);
		buf.writeFloatLE(1.0, 0);
		buf.writeFloatLE(-0.5, 4);

		trans.on('data', function (newBuf) {
			var val1 = newBuf.readInt16BE(0);
			var val2 = newBuf.readInt16BE(2);

			try {
				assert.equal(Math.pow(2, 15) - 1, val1);
				assert.equal(-Math.pow(2, 14), val2);
				cb();
			}
			catch(e) { cb(e); }
		});

		trans.on('error', cb);
		trans.write(buf);
	});
});


describe('Upmix/Downmix channels', function () {

});


describe('Remap channels', function () {

});


describe('Interleaved/planar', function () {

});


describe('Resample', function () {

});


describe('Output buffer size', function () {

});


describe('Passthrough', function () {

});