const { Transform } = require('stream');
const os = require('os');

class LineSplitStream extends Transform {
  constructor(options) {
    super(options);
    this.encoding = options.encoding || 'utf-8';
    this.remaining = '';
  }

  _transform(chunk, encoding, callback) {
    const chunkString = chunk.toString(this.encoding);
    const lines = chunkString.split(os.EOL);
    lines[0] = this.remaining + lines[0];

    this.remaining = lines.pop();

    for (const line of lines) {
      this.push(line);
    }

    callback();
  }

  _flush(callback) {
    if (this.remaining) {
      this.push(this.remaining);
    }

    callback();
  }
}

module.exports = LineSplitStream;
