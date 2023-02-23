const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const urlObj = url.parse(req.url);
  const pathname = urlObj.pathname.slice(1);

  if (pathname.includes('/') || pathname.includes('..')) {
    res.statusCode = 400;
    res.end('Nested paths are not supported');
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      if (fs.existsSync(filepath)) {
        res.statusCode = 409;
        res.end('File already exists');
        return;
      }

      const limitStream = new LimitSizeStream({limit: 1048576});
      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});

      req.pipe(limitStream).pipe(writeStream);

      limitStream.on('error', (err) => {
        if (err.code === 'LIMIT_EXCEEDED') {
          res.statusCode = 413;
          res.end('File is too large');
          fs.unlink(filepath, () => {});
        } else {
          res.statusCode = 500;
          res.end('Internal server error');
          fs.unlink(filepath, () => {});
        }
      });

      writeStream.on('error', (err) => {
        if (err.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('File already exists');
        } else {
          res.statusCode = 500;
          res.end('Internal server error');
          fs.unlink(filepath, () => {});
        }
      });

      writeStream.on('finish', () => {
        res.statusCode = 201;
        res.end('File created successfully');
      });

      req.on('aborted', () => {
        fs.unlink(filepath, () => {});
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
