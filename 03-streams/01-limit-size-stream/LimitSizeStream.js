const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.encoding = options.encoding;
    this.summ = 0;
  }

  _transform(chunk, encoding, callback) {
    this.summ += chunk.length;
    const err = new LimitExceededError();
    if (this.summ <= this.limit) {
      callback(null, chunk);
    } else {
      callback(err, chunk);
    }
  }
}

module.exports = LimitSizeStream;
