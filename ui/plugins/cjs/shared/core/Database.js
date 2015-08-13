var { makeHref } = require('actions/RouteActions');
var config = require('config');
var { pluck } = require('lodash');
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

  getClass(classId) {
    var classDocs = this.getClasses();

    return classDocs.filter(function(classEntry) {
      return classEntry.id === classId;
    })[0];
  },

  getClasses() {
    return config.database.filter(function(entry) {
      return entry.isClass;
    });
  },

  getTagsForClass(classId) {
    var classDoc = this.getClass(classId);

    if (!classDoc) {
      console.warn('Unable to find class entry with id ' + classId);
      return [];
    }

    return config.database.reduce(function(classDocs, doc) {
      if (doc.ctx) {
        if (doc.ctx.receiver === classDoc.ctx.name) {
          classDocs.push(doc);
        }
        else if (
          ['method', 'function'].indexOf(doc.ctx.type) > -1 &&
          doc.tags.some(function(tag) {
            return tag.type === 'memberOf' && tag.parent === classDoc.ctx.name;
          })
        ) {
          classDocs.push(doc);
        }
      }

      return classDocs;
    }, [classDoc]);
  },

  getClassMethods(classId) {
    var classDocs = this.getTagsForClass(classId);
    return classDocs;
  },

  getLinks() {
    return this.getClasses().reduce(function(links, entry) {
      links[entry.id] = {
        href: makeHref('js.class', { classId: entry.id }),
        title: entry.id
      };

      return links;
    }, {});
  }
};