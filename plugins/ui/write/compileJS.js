var webpack = require('webpack');
var generateCustomWebpackConfig = require('../../../ui/webpack/common');

module.exports = function compileJS(compiler, config, done) {
  var scripts = compiler.assets.inlineRuntimeScripts;

  if (!scripts.length) {
    done();
    return;
  }

  var webpackConfig = generateCustomWebpackConfig({
    entry: scripts,

    output: {
      path: compiler.utils.getOutputPath(),
      filename: 'inline_plugins.js',
      jsonpFunction: 'webpackJsonp_InlinePlugins'
    },

    plugins: [
      new webpack.NoErrorsPlugin()
    ],

    externals: require('../../../ui/webpack/externals')
  });

  console.log('Compiling %d plugins: %s.',
    scripts.length,
    JSON.stringify(scripts, null, 2)
  );

  webpack(webpackConfig, function(err, stats) {
    if (err) {
      console.log('Inline plugins compilation failed!!!', err);
      return done(err);
    }

    var jsonStats = stats.toJson();
    if (jsonStats.errors.length > 0) {
      return done(jsonStats.errors);
    }
    else if (jsonStats.warnings.length > 0) {
      return done(jsonStats.warnings);
    }

    console.log('Inline plugins were compiled successfully.');

    done();
  });
};