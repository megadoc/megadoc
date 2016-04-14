const Database = require('./Database');
const Storage = require('core/Storage');
const K = require('constants');
const PreviewHandler = require('./PreviewHandler');

Storage.register(K.CFG_CLASS_BROWSER_GROUP_BY_FOLDER, true);

tinydoc.use(function MarkdownPlugin(api) {
  const configs = tinydoc.getRuntimeConfigs('markdown');

  configs.forEach(function(config) {
    register(api, config);
  });
});

function register(api, config) {
  const { routeName } = config;
  const database = Database.createDatabase(routeName, config);

  api.addRoutes([
    {
      name: routeName,
      path: config.path || routeName
    },

    {
      name: `${routeName}.landing`,
      default: true,
      handler: require('./screens/Landing'),
      parent: routeName
    },

    {
      name: `${routeName}.article`,
      path: ':articleId',
      handler: require('./screens/Article'),
      parent: routeName,
      ignoreScrollBehavior: true,
    },

    {
      name: `${routeName}.article.section`,
      parent: `${routeName}.article`,
      path: ':sectionId',
      ignoreScrollBehavior: true,
    }
  ]);

  api.registerPreviewHandler(PreviewHandler(config, database));

  require('./outlets/MultiPageLayout')(api, config);
  require('./outlets/SinglePageLayout')(routeName, config);
}