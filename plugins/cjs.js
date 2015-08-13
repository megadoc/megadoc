module.exports = {
  name: 'cjs',
  register: function(tiny) {
    tiny.registerScanner(require('../scanners/cjs'));
    tiny.registerWriter(require('../writers/cjs'));
  }
};