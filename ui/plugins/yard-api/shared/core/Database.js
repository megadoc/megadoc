var config = require('config');

module.exports = {
  getAllTags() {
    return config.database;
  },

  getCodeObject(path) {
    return config.database.filter(function(codeObject) {
      return codeObject.object === path;
    })[0];
  },

  getCodeObjects(path) {
    return this.getCodeObject(path).methods;
  }
};