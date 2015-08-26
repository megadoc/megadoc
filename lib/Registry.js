function Registry() {
  this.entries = {};
}

Registry.prototype.add = function(id, entry) {
  this.entries[id] = entry;
};

Registry.prototype.toJSON = function() {
  return this.entries;
};

module.exports = Registry;