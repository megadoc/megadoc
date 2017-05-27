const modRewrite = require('connect-modrewrite');

module.exports = function proxyAssets(config, app) {
  const { runtimeOutputPath: basePath, files } = config;
  const rewrites = files.map(filePath => (
    `^${basePath}/${filePath}$ - [G]`
  ))

  app.use(modRewrite(rewrites));
}