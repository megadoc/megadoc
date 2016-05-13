var template = require('lodash').template;
var assign = require('lodash').assign;
var fs = require('fs');
var path = require('path');
var K = require('./HTMLSerializer__constants');
var invariant = require('invariant');

function buildRelativeAssetList(list, distanceFromRoot) {
  if (distanceFromRoot < 1) {
    return list;
  }

  var relativePathPrefix = Array(distanceFromRoot).join('../');

  return list.map(function(filePath) {
    return relativePathPrefix + filePath;
  });
}

exports.generateHTMLFile = function(params) {
  invariant(params && typeof params === 'object',
    "Expected @params to be an object.");

  var assets = params.assets;
  var distanceFromRoot = params.distanceFromRoot;

  invariant(assets && typeof assets === 'object',
    "Expected @assets to be the Asset registry.");

  invariant(typeof params.sourceFile === 'string',
    "Expected @sourceFile to be a path to an .html file.");

  invariant(typeof distanceFromRoot === 'number',
    "Expected @distanceFromRoot to be a number.");

  // invariant(Array.isArray(params.scripts),
  //   "Expected @scripts to be assigned.");

  // invariant(Array.isArray(params.styleSheets),
  //   "Expected @styleSheets to be assigned.");

  var CORE_SCRIPTS = [
    K.CONFIG_FILE,
    K.VENDOR_BUNDLE + '.js',
    K.MAIN_BUNDLE + '.js'
  ];

  var scripts = CORE_SCRIPTS
    .concat(assets.runtimeScripts)
    .concat(
      assets.pluginScripts.map(function(filePath) {
        return 'plugins/' + path.basename(filePath);
      })
    )
  ;

  var styleSheets = [ K.STYLE_BUNDLE ];
  var tmpl = template(fs.readFileSync(params.sourceFile, 'utf-8'));

  return tmpl(assign({}, {
    scripts: buildRelativeAssetList(scripts, distanceFromRoot),
    styleSheets: buildRelativeAssetList(styleSheets, distanceFromRoot),
  }, params.params));
}