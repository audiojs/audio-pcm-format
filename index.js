/**
 * @module audio-pcm-format
 */

var inherits = require('inherits');
var Through = require('audio-through');
var util = require('pcm-util');
var extend = require('xtend/mutable');

/** @constructor */
function PCMFormat (input, output) {
    if (!(this instanceof PCMFormat)) return new PCMFormat(input, output);

    Through.call(this, output);

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
}

inherits(PCMFormat, Through);


PCMFormat.prototype.process = function (buffer) {
    var self = this;

    var input = self.input, output = self.output;
    var out = util.convert(util.toArrayBuffer(buffer), input, output);

    return Buffer.from(out);
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
};

/** Default PCM settings. Technically redefinable. */
PCMFormat.default = extend({}, util.defaultFormat);
PCMFormat.default.samplesPerFrame = null;


module.exports = PCMFormat;
