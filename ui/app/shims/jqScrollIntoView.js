const $ = require('jquery');

require('imports?jQuery=jquery!imports?define=>undefined!../vendor/jquery.scrollintoview.js');

module.exports = function(el, options) {
  $(el).scrollintoview(options);
};
