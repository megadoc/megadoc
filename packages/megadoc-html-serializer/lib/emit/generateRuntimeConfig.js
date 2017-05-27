const path = require('path');
const { VERSION } = require('../constants');

module.exports = function generateRuntimeConfig(config, assets) {
  return {
    assetRoot: config.assetRoot,

    collapsibleSidebar: !!config.collapsibleSidebar,

    emittedFileExtension: config.emittedFileExtension,

    footer: config.footer,

    banner: config.banner,
    bannerLinks: config.bannerLinks,
    singlePageMode: config.singlePageMode,
    customLayouts: config.customLayouts,

    redirect: config.redirect,
    rewrite: config.rewrite,

    metaDescription: config.metaDescription,
    motto: config.motto,

    pluginCount: assets.pluginScripts.length,
    pluginConfigs: assets.runtimeConfigs,
    pluginNames: assets.pluginScripts.map(getPluginName),

    resizableSidebar: !!config.resizableSidebar,
    fixedSidebar: !!config.fixedSidebar,

    scrollSpying: !!config.scrollSpying,
    sourceStyleSheets: assets.styleSheets,
    spotlight: !!config.spotlight,
    styleOverrides: config.styleOverrides,

    themeOptions: config.themeOptions,
    title: config.title,
    tooltipPreviews: !!config.tooltipPreviews,

    version: VERSION,
  };
};


function getPluginName(filePath) {
  return path.basename(filePath).replace(/\.js$/, '');
}