const crypto = require('crypto');

module.exports = function generateUID(object) {
  return calculateMD5Sum(JSON.stringify(object));
}

function calculateMD5Sum(string) {
  return crypto.createHash('md5').update(string).digest("hex");
}