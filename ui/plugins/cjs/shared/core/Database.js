var { makeHref } = require('actions/RouteActions');
var config = require('config');
var { pluck, findWhere } = require('lodash');
var findCommonPrefix = require('tinydoc/lib/utils/findCommonPrefix');

var commonPrefix;

module.exports = {
  getCommonPrefix() {
    if (!commonPrefix) {
      commonPrefix = findCommonPrefix(pluck(config.database, 'filePath'), '/');
    }

    return commonPrefix;
  },

  getAllTags() {
    return config.database;
  },

  getModule(moduleId) {
    return findWhere(this.getModules(), { id: moduleId });
  },

  getModules() {
    if (!this.modules) {
      this.modules = config.database.filter(function(entry) {
        return entry.isModule;
      });
    }

    return this.modules;
  },

  getModuleEntities(moduleId) {
    var classDoc = this.getModule(moduleId);

    if (!classDoc) {
      console.warn('Unable to find class entry with id ' + moduleId);
      return [];
    }

    return config.database.reduce(function(classDocs, doc) {
      if (doc.ctx) {
        if (doc.ctx.receiver === classDoc.id) {
          classDocs.push(doc);
        }
        else if (
          ['method', 'function'].indexOf(doc.ctx.type) > -1 &&
          doc.tags.some(function(tag) {
            return tag.type === 'memberOf' && tag.parent === classDoc.id;
          })
        ) {
          classDocs.push(doc);
        }
      }

      return classDocs;
    }, [classDoc]);
  },

  getLinks() {
    return this.getModules().reduce(function(links, doc) {
      links[doc.id] = links[doc.ctx.name] = {
        href: makeHref('js.module', { moduleId: doc.id }),
        title: doc.ctx.name
      };

      return links;
    }, {});
  }
};