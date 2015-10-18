const $ = require('jquery');

require('imports?jQuery=jquery!../vendor/jquery.scrollintoview.js');

module.exports = function(node, options) {
  $(node).scrollintoview(options);
};
