const { assign, where, findWhere, sortBy } = require('lodash');
const strHumanize = require('tinydoc/lib/utils/strHumanize');

function createDatabase(config) {
  let articles = sortBy(config.database, 'title');
  let folders = [];

  function createFolderConfig(folderPath) {
    const folderConfig = findWhere(config.folders, { path: folderPath });

    let folder = assign({}, folderConfig, { path: folderPath });

    // generate a title
    if (!folder.title) {
      if (config.fullFolderTitles) {
        folder.title = folderPath
          .replace(config.commonPrefix, '')
          .split('/')
          .map(strHumanize)
          .join(config.fullFolderTitleDelimiter)
        ;
      }
      else {
        const fragments = folderPath.split('/');
        folder.title = strHumanize(fragments[fragments.length-1]);
      }
    }

    return folder;
  }

  // generate folders
  config.database.forEach((article) => {
    if (!findWhere(folders, { path: article.folder })) {
      folders.push(createFolderConfig(article.folder));
    }
  });

  folders.forEach(function(folder) {
    folder.articles = where(articles, { folder: folder.path });

    if (folder.series) {
      folder.articles = sortBy(folder.articles, 'fileName');
    }

    // README always comes first
    folder.articles = sortBy(folder.articles, function(a) {
      if (a.fileName === 'README') {
        return -1;
      }
      else {
        return 1;
      }
    });
  });

  folders = sortBy(folders, 'title');

  let exports = {
    getTitle() {
      return config.title;
    },

    getArticles() {
      return articles;
    },

    get(articleId) {
      return findWhere(articles, { id: decodeURIComponent(articleId) });
    },

    getFolders() {
      return folders;
    }
  };

  return exports;
}

let databases = [];

module.exports = {
  createDatabase(key, config) {
    const database = createDatabase(config);

    databases[key] = database;

    return database;
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