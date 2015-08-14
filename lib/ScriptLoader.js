function ScriptLoader() {
  this.scripts = [];
}

ScriptLoader.prototype.addScript = function(path) {
  this.scripts.push(path);
};

ScriptLoader.prototype.getScripts = function() {
  return this.scripts;
};

ScriptLoader.prototype.run = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};

module.exports = ScriptLoader;