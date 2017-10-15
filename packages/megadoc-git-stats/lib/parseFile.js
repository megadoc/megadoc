const http = require('http');

module.exports = function parse(context, filePath, done) {
  const req = http.request({
    method: 'GET',
    host: 'localhost',
    port: 17654,
    path: '/',
    headers: {
      'X-File': filePath,
    },
  }, function(res) {
    let buffer = ''

    res.on('data', (chunk) => {
      buffer += chunk;
    });

    res.on('end', function() {
      done(null, JSON.parse(buffer));
    });
  });

  req.on('error', (e) => {
    done(e);
  });

  req.end();
}