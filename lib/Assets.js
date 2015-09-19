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

Assets.prototype.add = function(path) {
  pushUnique(this.files, path);
};

Assets.prototype.addStyleSheet = function(path) {
  pushUnique(this.styleSheets, path);
};

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
