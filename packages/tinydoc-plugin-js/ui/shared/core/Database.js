const { where, findWhere, sortBy, groupBy } = require('lodash');

let databases = {};

function createDatabase(key, config) {
  const bank = tinydoc.corpus.getCatalogue(key);

  let exports = {
    getModule(moduleId) {
      return tinydoc.corpus.get(`${key}/${moduleId}`);
    },

    getModuleEntities(moduleId) {
      return tinydoc.corpus.get(`${key}/${moduleId}`).entities.map(x => x.properties);
    },
  };

  return exports;
}

module.exports = {
  createDatabase(config) {
    const key = config.routeName;

    databases[key] = createDatabase(key, config);

    return databases[key];
  },

  for(key) {
    return databases[key];
  },

  getAllDatabases() {
    return Object.keys(databases).map(function(id) {
      return databases[id];
    });
  },
};
