/**
 * @namespace Core
 *
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
 *        The path of the asset relative to the [Core.Config@assetRoot]().
 *        This can either be a path to a single file, or a directory of files.
 */
Assets.prototype.add = function(path) {
  pushUnique(this.files, path);
};

/**
 * Add a stylesheet of type `.css` or `.less` to the asset listing. This
 * stylesheet will be processed during compilation through the LESS processor.
 */
Assets.prototype.addStyleSheet = function(path) {
  pushUnique(this.styleSheets, path);
};

/**
 * Add a script that will be included by the resulting HTML file.
 *
 * @param {String} path
 *        The path relative to the HTML file to where the script will be
 *        located. Note that you are responsible to stage and copy the file
 *        yourself using something like [Core.Utils#writeAsset]().
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
