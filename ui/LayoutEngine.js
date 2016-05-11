/**
 * @module LayoutEngine
 *
 * @typedef {LayoutOverride}
 *
 * A layout override configuration object. This object describes how to render
 * a certain page. By default, tinydoc will compute a preferred layout based on
 * the type of document that is being rendered.
 *
 * @property {Object} match
 *           The parameters that control when this configuration applies.
 *
 * @property {url|uid|type} match.by
 *           What we should match on.
 *
 * @property {String|Array.<String>} match.on
 *           The value for matching:
 *
 *           - If @match.by was set to `url`, this would be the URL(s) of the
 *           pages.
 *           - If @match.by was set to `uid`, this would be the corpus UIDs
 *           of the documents.
 *           - If @match.by was set to `type`, this would be the corpus ADT
 *           node type. See [[T]].
 *
 * @property {Array.<LayoutRegion>} regions
 *
 * @typedef {LayoutRegion}
 *
 * A configuration object for a specific layout region.
 *
 * @property {String} name
 *           The name of the region. See [[Layout]] for the regions it defines.
 *
 * @property {Object?} options
 *           Options to customize how the region looks like. Refer to each
 *           region's documentation to know what options it supports.
 *
 * @property {Array.<LayoutRegionOutlet>} outlets
 *           The outlets to fill the region with.
 *
 * @typedef {LayoutRegionOutlet}
 *
 * @property {String} name
 * @property {Object?} options
 */

/**
 * @param {String} href
 * @param {Object} layoutConfig
 * @param {Array.<LayoutOverride>} layoutConfig.customLayouts
 *
 * @return {String}
 *         The UID of the document to use for the given location.
 */
exports.getDocumentOverride = function(href, layoutConfig) {
  const url = href.split('#')[0]; // ignore hash/DocumentEntity links here

  if (layoutConfig.customLayouts) {
    const layoutOverride = layoutConfig.customLayouts.filter(x => {
      return x.match.by === 'url' && x.match.on === url;
    })[0];

    if (layoutOverride && layoutOverride.using) {
      return layoutOverride.using;
    }
  }
};