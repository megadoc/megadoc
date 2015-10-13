const { where, findWhere } = require('lodash');

let databases = {};

function createDatabase(key, database) {
  const moduleDocs = where(database, { isModule: true });

  let exports = {
    getKey() {
      return key;
    },

    getAllDocs() {
      return database;
    },

    getModules() {
      return moduleDocs;
    },

    getModule(moduleId) {
      return findWhere(moduleDocs, { id: moduleId });
    },

    getModuleEntities(moduleId) {
      const moduleDoc = this.getModule(moduleId);

      if (!moduleDoc) {
        console.warn('Unable to find class entry with id ' + moduleId);
        return [];
      }

      return where(database, { receiver: moduleDoc.id });
    },
  };

  // we'll need this for @preserveOrder support
  database.forEach(function(doc) {
    if (doc.loc) {
      doc.line = doc.loc.start.line;
      doc.tags.forEach(function(tag) {
        tag.line = doc.line;
      });
    }
  });

  return exports;
}

module.exports = {
  createDatabase(config) {
    const key = config.routeName;

    databases[key] = createDatabase(key, config.database);

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