const VERSION = require('./constants').VERSION;
const path = require('path');

module.exports = function generateRuntimeConfig(config, state) {
  return {
    collapsibleSidebar: !!config.collapsibleSidebar,

    emittedFileExtension: config.emittedFileExtension,

    footer: config.footer,

    layoutOptions: config.layoutOptions,

    metaDescription: config.metaDescription,
    motto: config.motto,

    pluginCount: state.assets.pluginScripts.length,
    pluginConfigs: state.assets.runtimeConfigs,
    pluginNames: state.assets.pluginScripts.map(getPluginName),

    resizableSidebar: !!config.resizableSidebar,

    scrollSpying: !!config.scrollSpying,
    sourceStyleSheets: state.assets.styleSheets,
    spotlight: !!config.spotlight,

    themeOptions: config.themeOptions,
    title: config.title,
    tooltipPreviews: !!config.tooltipPreviews,

    version: VERSION,
  };
};


function getPluginName(filePath) {
  return path.basename(filePath).replace(/\.js$/, '');
}