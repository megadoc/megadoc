const { where, findWhere, sortBy, groupBy } = require('lodash');

let databases = {};

function createDatabase(key, config) {
  const { database } = config;
  const moduleDocs = where(database, { isModule: true });

  const sortedModuleDocs = config.sortModulesAlphabetically ?
    sortBy(moduleDocs, 'id') :
    moduleDocs
  ;

  const namespaceModuleDocs = groupBy(sortedModuleDocs, 'namespace');

  let namespaces = Object.keys(namespaceModuleDocs).map(function(ns) {
    const hasNamespace = ns && ns !== 'undefined';
    const nsModule = hasNamespace && findWhere(moduleDocs, { id: ns });

    if (nsModule) {
      nsModule.$isNamespaceModule = true;
    }

    return {
      name: hasNamespace ? ns : '[General]',
      sortableName: hasNamespace ? '0' + ns.toLowerCase() : '1',
      module: nsModule,
      modules: namespaceModuleDocs[ns]
    };
  });

  namespaces = sortBy(namespaces, 'sortableName');

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

    getNamespacedModules() {
      return namespaces;
    },

    hasNamespaces() {
      return namespaces.length > 1;
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