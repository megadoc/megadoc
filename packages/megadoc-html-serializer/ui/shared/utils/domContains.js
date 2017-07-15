if (typeof document !== 'undefined') {
  module.exports = require('dom-contains');
}
else {
  module.exports = function domContains() { return false; }
}