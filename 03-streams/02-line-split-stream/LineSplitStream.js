const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.str = '';
    this.buffer = '';
    this.bufferAfterWriteStr = '';
    this.arr = [];
  }

  _transform(chunk, encoding, callback) {
    const chunkStr = chunk.toString();
    if (chunkStr.includes(os.EOL)) {
      this.arr = chunkStr.split(os.EOL);
      this.bufferAfterWriteStr = this.arr.pop();
      if (this.buffer) {
        this.str = this.buffer + chunkStr.split(os.EOL)[0];
        this.bufferAfterWriteStr = chunkStr.split(os.EOL).pop();
        this.buffer = chunkStr.split(os.EOL).pop();
      } else {
        if (this.arr.length > 2) {
          this.arr.forEach(el => {
            this.emit('data', el);
          });
          callback(null);
          return;
        } else {
          this.str = chunkStr.split(os.EOL)[0];
          this.bufferAfterWriteStr = chunkStr.split(os.EOL).pop();
        }
      }
      if (this.str) {
        const res = this.str;
        this.str = '';
        callback(null, res);
      }
    } else {
      this.str = chunkStr.split(os.EOL)[0];
      this.buffer = chunkStr.split(os.EOL).pop();
      callback();
    }
  }

  _flush(callback) {
    if ( this.arr.length > 2 ) {
      callback(null, this.bufferAfterWriteStr);
      return;
    }
    callback(null, this.bufferAfterWriteStr + this.buffer);
  }
}

module.exports = LineSplitStream;
