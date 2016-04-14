## Generating a README for a landing page

The convention is to use a config parameter named `readme` that points to
a markdown or html file to use for the landing page.

The next step is to render the asset during the `render` phase and write it:

```javascript
// assuming a config as such:
var config = {
  routeName: 'my-plugin',
  readme: 'doc/my-plugin-readme.md'
};

var database = {};
var runtimeConfig = {};

compiler.on('render', function(renderMarkdown, linkify, done) {
  if (config.readme) {
    database.readme = renderMarkdown.withTOC(
      linkify(
        fs.readFileSync(compiler.utils.getAssetPath(config.readme), 'utf-8')
      ), {
        baseURL: '/' + config.routeName + '/readme'
      }
    );
  }

  done();
});

compiler.on('write', function(done) {
  if (database.readme) {
    runtimeConfig.readme = {
      filePath: config.readme,
      source: database.readme,
      git: database.readmeGitStats
    };
  }

  compiler.assets.addPluginRuntimeConfig('my-plugin', runtimeConfig);

  done();
});
```