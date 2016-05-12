const Database = require('./Database');
const Storage = require('core/Storage');
const K = require('constants');

Storage.register(K.CFG_CLASS_BROWSER_GROUP_BY_FOLDER, true);

tinydoc.outlets.define('Markdown::Document');
tinydoc.outlets.define('Markdown::DocumentTOC');
tinydoc.outlets.define('Markdown::ArticleIndex');

tinydoc.use('tinydoc-plugin-markdown', function MarkdownPlugin(api, configs) {
  require('./outlets/ArticleIndexOutlet');
  require('./outlets/DocumentOutlet');
  require('./outlets/DocumentTOCOutlet');

  configs.forEach(function(config) {
    const { routeName } = config;
    Database.createDatabase(api, routeName, config);

    // api.addRoutes([
    //   {
    //     name: routeName,
    //     path: config.path || routeName
    //   },

    //   {
    //     name: `${routeName}.landing`,
    //     default: true,
    //     handler: require('./screens/Landing'),
    //     parent: routeName
    //   },

    //   {
    //     name: `${routeName}.article`,
    //     path: ':articleId',
    //     handler: require('./screens/Article'),
    //     parent: routeName,
    //     ignoreScrollBehavior: true,
    //   },

    //   {
    //     name: `${routeName}.article.section`,
    //     parent: `${routeName}.article`,
    //     path: ':sectionId',
    //     ignoreScrollBehavior: true,
    //   }
    // ]);

    // require('./outlets/MultiPageLayout')(api, config);
    // require('./outlets/SinglePageLayout')(api, config);
  });
});