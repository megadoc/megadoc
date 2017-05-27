const path = require('path');
const webpack = require('webpack');
const K = require('../constants');
const ROOT = K.ROOT;
const createCSSCompiler = require(path.join(ROOT, 'webpack/createCSSCompiler'))

module.exports = function compileCSS(config, state, done) {
  const webpackConfig = createCSSCompiler({
    files: state.assets.styleSheets,
    outputDir: state.assetUtils.getOutputPath(config.runtimeOutputPath),
    outputFileName: K.STYLE_BUNDLE,
    styleOverrides: state.assets.styleOverrides,
  })

  if (config.verbose) {
    console.log('Compiling CSS assets:\n%s', JSON.stringify(webpackConfig.entry, null, 2));
  }

  webpack(webpackConfig, function(err, stats) {
    if (err) {
      console.error('CSS compilation failed!!!');
      console.error(err.stack || err);

      return done(err);
    }

    const jsonStats = stats.toJson();

    if (jsonStats.errors.length > 0) {
      return done(jsonStats.errors);
    }

    jsonStats.warnings.forEach(function(message) {
      console.warn(message);
    });

    if (config.verbose) {
      console.log('CSS assets generated.');
    }

    done();
  });
};