// this file exposes "internal" APIs needed by megadoc-html-{dev,live}-server
// and megadoc-cli:
const K = require('./lib/constants');

exports.ClientSandbox = require('./lib/emit/ClientSandbox');
exports.RendererUtils = require('./lib/render/RendererUtils');
exports.WebpackExternalsPlugin = require('./webpack/ExternalsPlugin');

exports.extractRuntimeParameters = require('./addon/extractRuntimeParameters');
exports.compilePlugin = require('./lib/emit/PluginCompiler').compile;
exports.generateInlinePlugin = require('./lib/emit/generateInlinePlugin');
exports.constants = require('./lib/constants');
exports.webpackConfig = require('./webpack.config');
exports.webpackVendorModules = require('./webpack/vendorModules');

exports.COMMON_BUNDLE = K.COMMON_BUNDLE;
exports.CONFIG_BUNDLE = K.CONFIG_BUNDLE;
exports.CONFIG_FILE   = K.CONFIG_FILE;
exports.MAIN_BUNDLE   = K.MAIN_BUNDLE;
exports.VENDOR_BUNDLE = K.VENDOR_BUNDLE;