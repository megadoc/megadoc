const $ = require('jquery');

require('imports?jQuery=jquery!../vendor/jquery.scrollintoview.js');

module.exports = function(el, options) {
  $(el).scrollintoview(options);
};
