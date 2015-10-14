var assert = require('assert');

module.exports = function(database, id, registry) {
  var index = registry.entries[id];

  if (index && index.type === 'markdown') {
    var article = database.filter(function(entry) {
      return entry.id === index.articleId;
    })[0];

    assert(!!article,
      "Expected to find a markdown article with id '" + index.articleId + "'"
    );

    return {
      href: '#' + database.__meta__.routeName + '/' + article.id,
      title: article.title
    };
  }
};