module.exports = function(database, config) {
  var indices = {};

  database.forEach(function(article) {
    var filePath = article.filePath;
    var id = article.id;
    var index = {
      type: 'markdown',
      articleId: id
    };

    indices[filePath] = index;
    indices[id] = index;

    if (config.allowLeadingSlashInLinks) {
      if (filePath[0] !== '/') {
        indices['/' + filePath] = index;
      }

      if (id[0] !== '/') {
        indices['/' + id] = index;
      }
    }
  });

  return indices;
};
