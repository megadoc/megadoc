const { flowRight, partial, template } = require('lodash');
const fs = require('fs');
const path = require('path');
const K = require('../constants');
const invariant = require('invariant');
const CORE_SCRIPTS = [
  K.CONFIG_FILE,
  K.VENDOR_BUNDLE + '.js',
  // K.COMMON_BUNDLE + '.js',
  K.MAIN_BUNDLE + '.js'
];

module.exports = function generateHTMLFile(params) {
  invariant(params && typeof params === 'object',
    "Expected @params to be an object.");

  const assets = params.assets;
  const distanceFromRoot = params.distanceFromRoot;
  const runtimeOutputPath = params.runtimeOutputPath;

  invariant(assets && typeof assets === 'object',
    "Expected @assets to be the Asset registry.");

  invariant(typeof params.sourceFile === 'string',
    "Expected @sourceFile to be a path to an .html file.");

  invariant(typeof distanceFromRoot === 'number',
    "Expected @distanceFromRoot to be a number.");

  invariant(typeof runtimeOutputPath === 'string',
    "Expected @runtimeOutputPath to be a string.");

  // invariant(Array.isArray(params.scripts),
  //   "Expected @scripts to be assigned.");

  // invariant(Array.isArray(params.styleSheets),
  //   "Expected @styleSheets to be assigned.");


  const scripts = []
    .concat(assets.runtimeScripts)
    .concat(
      assets.pluginScripts.map(function(filePath) {
        return path.basename(filePath);
      })
    )
  ;

  const favicon = params.favicon;

  const styleSheets = [ K.STYLE_BUNDLE ];
  const tmpl = template(fs.readFileSync(params.sourceFile, 'utf-8'));
  const scopeToRuntimeOutputPath = partial(scopeToPath, params.runtimeOutputPath);
  const relativize = partial(buildRelativeAssetList, distanceFromRoot);
  const realizePath = flowRight(scopeToRuntimeOutputPath, relativize);

  return tmpl(Object.assign({
    coreScripts: realizePath(CORE_SCRIPTS),
    commonModuleScript: realizePath([ K.COMMON_BUNDLE + '.js' ]),
    pluginScripts: realizePath(scripts),
    styleSheets: realizePath(styleSheets),
    favicon: favicon ? buildRelativeAssetList(distanceFromRoot, [ favicon ]) : null,
  }, params.params));
};

function buildRelativeAssetList(distanceFromRoot, list) {
  if (distanceFromRoot < 1) {
    return list;
  }

  const relativePathPrefix = Array(distanceFromRoot).join('../');

  return list.map(function(filePath) {
    return relativePathPrefix + filePath;
  });
}

function scopeToPath(basePath, list) {
  return list.map(x => {
    const dirname = path.dirname(x);
    const filename = path.basename(x);

    return path.join(dirname, path.join(basePath, filename));
  });
}