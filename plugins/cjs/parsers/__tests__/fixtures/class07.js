// 1. inference of module name from filename
// 2. attaching exports to the module

var stylesheet;

function createStylesheet() {
};

function addColorRules(sheet, options) {
};

/**
 * Installs new custom branding styles by injecting a stylesheet into the
 * document with the rules defined in #addColorRules
 *
 * @param {Boolean} options.enabled
 *        Is custom branding enabled.
 *
 * @param {String} options.hex_color
 *        The hex string of the color: eg #ffffff.
 *
 * @param {String} options.logo_url
 *        The url for the brand logo.
 *
 * @param {String} options.reverse_logo_url
 *        The url for the reversed brand logo
 */
function install(options) {
  uninstall();

  // only install a new sheet if enabled
  if (options.enabled) {
    stylesheet = createStylesheet();
    addColorRules(stylesheet, options);
  }
};

/**
 * Remove the injected stylesheet
 */
function uninstall() {
  if (stylesheet && stylesheet.ownerNode) {
    var node = stylesheet.ownerNode;
    node.parentNode.removeChild(node);
    stylesheet = null;
  }
}

/**
 * Get a reference to the injected stylesheet
 */
function getStylesheet() {
  return stylesheet;
}

exports.install = install;
exports.uninstall = uninstall;
exports.getStylesheet = getStylesheet;
