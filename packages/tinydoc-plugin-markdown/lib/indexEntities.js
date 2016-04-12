module.exports = function(database, routeName, config) {
  var indices = {};
  var searchTokens = [];

  var folderConfigs = (config.folders || []).reduce(function(set, x) {
    set[x.path] = x;
    return set;
  }, {});

  database.forEach(function(article) {
    var filePath = article.filePath;
    var id = article.id;
    var index = {
      type: 'markdown',
      articleId: id,
      routeName: routeName
    };

    indices[filePath] = index;
    indices[id] = index;
    indices[article.plainTitle] = index;

    if (config.allowLeadingSlashInLinks) {
      if (filePath[0] !== '/') {
        indices['/' + filePath] = index;
      }

      if (id[0] !== '/') {
        indices['/' + id] = index;
      }
    }

    searchTokens.push(buildSearchTokens(article, index));
  });

  function buildSearchTokens(article) {
    var folderConfig = folderConfigs[article.folder];
    var tokens = {};

    if (folderConfig && folderConfig.title) {
      tokens.$1 = folderConfig.title + ' - ' + article.plainTitle;
      tokens.$2 = article.plainTitle;
      tokens.$3 = article.filePath;
    }
    else {
      tokens.$1 = article.plainTitle;
      tokens.$2 = article.filePath;
    }

    tokens.link = {
      href: '/' + routeName + '/' + encodeURIComponent(article.id)
    };

    return tokens;
  }

  return { indices: indices, searchTokens: searchTokens };
};
