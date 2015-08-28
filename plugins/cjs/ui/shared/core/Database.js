const { database } = require('config');
const { pluck, where, findWhere } = require('lodash');
const findCommonPrefix = require('tinydoc/lib/utils/findCommonPrefix');
const DocClassifier = require('core/DocClassifier');

const commonPrefix = findCommonPrefix(pluck(database, 'filePath'), '/');
const moduleDocs = where(database, { isModule: true });

const Database = {
  getCommonPrefix() {
    return commonPrefix;
  },

  getAllTags() {
    return database;
  },

  getModule(moduleId) {
    return findWhere(moduleDocs, { id: moduleId });
  },

  getModules() {
    return moduleDocs;
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

Database.getModules().forEach(function(module) {
  module.renderableType = DocClassifier.getRenderableType(
    module,
    Database.getModuleEntities(module.id)
  );
});

// we'll need this for @preserveOrder support
database.forEach(function(doc) {
  if (doc.loc) {
    doc.line = doc.loc.start.line;
    doc.tags.forEach(function(tag) {
      tag.line = doc.line;
    });
  }
});

module.exports = Database;