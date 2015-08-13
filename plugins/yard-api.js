module.exports = {
  name: 'yard-api',
  register: function(tiny) {
    tiny.registerScanner(require('../scanners/yard-api'));
    tiny.registerWriter(require('../writers/yard-api'));
  }
};