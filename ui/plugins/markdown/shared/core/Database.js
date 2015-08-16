var config = require('config');
var { findWhere, uniq, pluck } = require('lodash');
var { makeHref } = require('actions/RouteActions');
var strHumanize = require('tinydoc/lib/utils/strHumanize');

var folders = {};

module.exports = {
  getCollectionTitle(collectionName) {
    return findWhere(config.collections, { name: collectionName }).title;
  },

  getArticleTitles(collection) {
    return config.database[collection];
  },

  get(collection, articleId) {
    return findWhere(config.database[collection], { id: decodeURIComponent(articleId) });
  },

  getFolders(collection) {
    if (!folders[collection]) {
      folders[collection] = uniq( pluck(config.database[collection], 'folder') );
    }

    return folders[collection];
  },

  getLinkableEntities() {
    return Object.keys(config.database).reduce(function(links, collection) {

      config.database[collection].forEach(function(entry) {
        links[entry.filePath] = {
          href: makeHref(`${collection}.article`, { articleId: entry.id }),
          title: `${strHumanize(collection)}: ${entry.title}`
        };
      });

      return links;
    }, {});
  }
};