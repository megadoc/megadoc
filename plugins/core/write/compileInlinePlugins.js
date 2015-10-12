var PluginCompiler = require('../../../lib/PluginCompiler');

module.exports = function compileInlinePlugins(compiler, config, done) {
  PluginCompiler.compile(
    compiler.assets.inlineRuntimeScripts,
    compiler.utils.getOutputPath('plugins/inline_plugins.js'),
    true,
    done
  );
};
