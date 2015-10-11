var PcmFormat = require('./');

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
		val1.should.be.closeTo(Math.pow(2, 15), 1);
		val2.should.be.closeTo(-Math.pow(2, 14), 1);
		cb();
	}
	catch(e) { cb(e); }
});

trans.on('error', cb);

trans.write(buf);