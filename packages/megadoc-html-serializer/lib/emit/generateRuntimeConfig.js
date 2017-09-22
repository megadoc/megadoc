const path = require('path');
const { VERSION } = require('../constants');

module.exports = function generateRuntimeConfig(config, assets) {
  return {
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
    pluginNames: assets.pluginScripts.map(getPluginName),

    resizableSidebar: !!config.resizableSidebar,
    fixedSidebar: !!config.fixedSidebar,
    invertedSidebar: !!config.invertedSidebar,
    sidebarWidth: config.sidebarWidth,

    scrollSpying: !!config.scrollSpying,
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