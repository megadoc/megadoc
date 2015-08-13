module.exports = {
  name: 'markdown',
  register: function(tiny) {
    tiny.registerScanner(require('../scanners/markdown'));
    tiny.registerWriter(require('../writers/markdown'));
  }
};