const crypto = require('crypto');

module.exports = function(source) {
  this.cacheable();

  return 'module.exports = "' + calculateMD5Sum(source) + '"';
};

function calculateMD5Sum(string) {
  return crypto.createHash('md5').update(string).digest("hex");
}
