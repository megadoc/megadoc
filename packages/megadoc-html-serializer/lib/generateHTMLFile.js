const template = require('lodash').template;
const fs = require('fs');
const path = require('path');
const K = require('./constants');
const invariant = require('invariant');
const CORE_SCRIPTS = [
  K.CONFIG_FILE,
  K.VENDOR_BUNDLE + '.js',
  K.MAIN_BUNDLE + '.js'
];

module.exports = function generateHTMLFile(params) {
  invariant(params && typeof params === 'object',
    "Expected @params to be an object.");

  const assets = params.assets;
  const distanceFromRoot = params.distanceFromRoot;

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


  const scripts = CORE_SCRIPTS
    .concat(assets.runtimeScripts)
    .concat(
      assets.pluginScripts.map(function(filePath) {
        return 'plugins/' + path.basename(filePath);
      })
    )
  ;

  const styleSheets = [ K.STYLE_BUNDLE ];
  const tmpl = template(fs.readFileSync(params.sourceFile, 'utf-8'));

  return tmpl(Object.assign({
    scripts: buildRelativeAssetList(scripts, distanceFromRoot),
    styleSheets: buildRelativeAssetList(styleSheets, distanceFromRoot),
  }, params.params));
};

function buildRelativeAssetList(list, distanceFromRoot) {
  if (distanceFromRoot < 1) {
    return list;
  }

  const relativePathPrefix = Array(distanceFromRoot).join('../');

  return list.map(function(filePath) {
    return relativePathPrefix + filePath;
  });
}
