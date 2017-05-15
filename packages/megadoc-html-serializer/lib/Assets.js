var assign = require('lodash').assign;

/**
 * A registry for all static assets that need to be present at run-time, like
 * stylesheets, JavaScript scripts, image files, or whatever.
 *
 * Assets can be accessed by their original path prefixed by `/assets/`. For
 * example, for an image found at `doc/images/lol.jpg`, it can be referenced in
 * the sources at `/assets/doc/images/lol.jpg`.
 */
function Assets() {
  this.files = [];
  this.styleSheets = [];
  this.pluginScripts = [];
  this.runtimeScripts = [];
  this.runtimeConfigs = {};
  this.styleOverrides = {};
}

function pushUnique(arr, item) {
  if (arr.indexOf(item) === -1) {
    arr.push(item);
  }
}

/**
 * Add a static file (or directory) to the asset listing.
 *
 * @param {String} path
 *        The path of the asset relative to the [Config@assetRoot]().
 *        This can either be a path to a single file, or a directory of files.
 *
 * @param {String} [outputPath]
 *        If present, you may specify an absolute path to where the asset
 *        should be copied (this will still be relative to the output directory,
 *        however.)
 *
 *        When this is not present, we assume the output path to be the source
 *        path prefixed by "/assets/".
 */
Assets.prototype.add = function(path, outputPath) {
  if (typeof path === 'object') {
    var assetMap = path;

    Object.keys(path).forEach(function(sourcePath) {
      this.add(sourcePath, assetMap[sourcePath]);
    }.bind(this));

    return;
  }

  var alreadyTracked = this.files.some(function(entry) {
    return (
      entry.sourcePath === path &&
      entry.outputPath === outputPath
    )
  });

  if (!alreadyTracked) {
    this.files.push({
      sourcePath: path.replace(/^\//, ''),
      outputPath: (outputPath || ('assets/' + path)).replace(/^\//, ''),
      isAbsolute: path[0] === '/',
      hasCustomOutputPath: !!outputPath,
    });
  }
};

/**
 * Add a stylesheet of type `.css` or `.less` to the asset listing. This
 * stylesheet will be processed during compilation through the LESS processor.
 */
Assets.prototype.addStyleSheet = function(path) {
  pushUnique(this.styleSheets, path);
};

Assets.prototype.addStyleOverrides = function(variables) {
  assign(this.styleOverrides, variables);
}
/**
 * Add a script that will be included by the resulting HTML file.
 *
 * @param {String} path
 *        The path relative to the HTML file to where the script will be
 *        located. Note that you are responsible to stage and copy the file
 *        yourself using something like [AssetUtils#writeAsset]().
 */
Assets.prototype.addRuntimeScript = function(path) {
  pushUnique(this.runtimeScripts, path);
};

Assets.prototype.addPluginScript = function(path) {
  pushUnique(this.pluginScripts, path);
};

Assets.prototype.addPluginRuntimeConfig = function(pluginId, config) {
  if (!this.runtimeConfigs[pluginId]) {
    this.runtimeConfigs[pluginId] = [];
  }

  this.runtimeConfigs[pluginId].push(config);
};

module.exports = Assets;
