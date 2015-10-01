var jQuery = require("jquery");
var qTip;

window.jQuery = jQuery;

require("imports?define=>undefined!imports?jquery=>jQuery!../vendor/jquery.qtip");

qTip = jQuery.fn.qtip;

qTip.defaults.position.adjust.resize = false;
qTip.defaults.position.adjust.scroll = true;
qTip.defaults.position.viewport = jQuery(window);
qTip.defaults.show.effect = false;
qTip.defaults.show.delay = 0;
qTip.defaults.hide.effect = false;
qTip.defaults.hide.delay = 0;
qTip.defaults.prerender = false;

// delete window.jQuery;

module.exports = function(node, qTipOptions) {
  return qTip.call(jQuery(node), qTipOptions).qtip("api");
};