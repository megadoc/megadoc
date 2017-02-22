const invariant = require('utils/invariant');

/**
 * @module LayoutEngine
 *
 * @typedef {LayoutOverride}
 *
 * A layout override configuration object. This object describes how to render
 * a certain page. By default, megadoc will compute a preferred layout based on
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
exports.getDocumentOverride = function(pathname, layoutConfig) {
  if (layoutConfig.customLayouts) {
    const layoutOverride = getLayoutOverride({ pathname, }, layoutConfig.customLayouts);

    if (layoutOverride && layoutOverride.using) {
      return layoutOverride.using;
    }
  }
};

function getLayoutOverride(scope, layouts) {
  if (!layouts) {
    return null;
  }

  return layouts.filter(x => {
    invariant(x.hasOwnProperty('match'),
      "A custom layout must have a @match property defined!"
    );

    return match(x, scope);
  })[0];
}

function getRegionsForDocument(scope, layouts) {
  const layoutOverride = getLayoutOverride(scope, layouts);

  if (layoutOverride) {
    return layoutOverride.regions;
  }
}

function arrayWrap(x) {
  return Array.isArray(x) ? x : [].concat(x || []);
}

function match(entry, { documentNode, namespaceNode, pathname }) {
  const matchBy = entry.match.by;
  const matchOn = arrayWrap(entry.match.on);

  return (
    (
      matchBy === 'type' &&
      (
        (documentNode && matchOn.indexOf(documentNode.type) > -1) ||
        (namespaceNode && matchOn.indexOf(namespaceNode.type) > -1)
      )
    ) ||
    (
      documentNode &&
      matchBy === 'uid' &&
      matchOn.indexOf(documentNode.uid) > -1
    ) ||
    (
      matchBy === 'url' &&
      matchByURL(matchOn, pathname)
    ) ||
    (
      matchBy === 'namespace' &&
      namespaceNode &&
      matchOn.indexOf(namespaceNode.uid) > -1
    )
  );
};

function matchByURL(matchOn, pathname) {
  const pathWithoutHash = pathname.split('#')[0];

  return matchOn.some(function(pattern) {
    if (pattern === '*') {
      return true;
    }

    return pathWithoutHash.match(pattern);
  });
}

exports.match = match;
exports.getRegionsForDocument = getRegionsForDocument;