const DocumentResolver = require('./DocumentResolver');
const LayoutEngine = require('./LayoutEngine');
const { assign } = require('lodash');
const { getRegionsForDocument } = LayoutEngine;

function TemplateRealizer(corpus, config) {
  const layoutConfig = config.layoutOptions;

  return function(globalScope, pathname) {
    const regions = Regions(globalScope, {
      // we'll need the pathname for filtering outlets:
      pathname: pathname,
      customLayouts: layoutConfig.customLayouts,
    });

    return {
      regions,
      hasSidebarElements: regions.some(x => x.name === 'Layout::Sidebar'),
    };
  };

  function Regions(globalScope, params) {
    const globalScopeWithPathname = assign({}, globalScope, {
      pathname: params.pathname
    });

    const regions = (
      // custom regions from a template:
      getRegionsForDocument(globalScopeWithPathname, params.customLayouts) ||
      // default regions from the plugin template:
      getDefaultDocumentRegions(globalScopeWithPathname) ||
      getDefaultGlobalRegions()
    );

    return regions.map(function(region) {
      return RegionWithActiveOutlets(region, globalScope, globalScopeWithPathname);
    });
  }

  function RegionWithActiveOutlets(region, globalScope, globalScopeWithPathname) {
    if (!region.outlets) {
      return region;
    }

    return assign({}, region, {
      outlets: region.outlets
        .filter(x => {
          return !x.match || LayoutEngine.match(x, globalScopeWithPathname);
        })
        .map(function(x) {
          return assign({}, x, { scope: getOutletScope(x, globalScope) });
        })
    });
  }

  function getDefaultDocumentRegions(scopeWithPathname) {
    const { namespaceNode } = scopeWithPathname;

    if (namespaceNode && namespaceNode.meta.defaultLayouts) {
      return getRegionsForDocument(scopeWithPathname, namespaceNode.meta.defaultLayouts);
    }
  }

  function getDefaultGlobalRegions() {
    return [
      {
        name: 'Layout::Content',
        outlets: null
      }
    ];
  }

  function getOutletScope(outlet, parentScope) {
    let customScope;

    if (outlet.using) {
      const node = corpus.get(outlet.using);

      if (node) {
        customScope = DocumentResolver.buildDocumentContext(node);
      }
    }

    if (outlet.injectionStrategy === 'fixate') {
      return customScope || parentScope;
    }
    else {
      return assign({}, parentScope, customScope);
    }
  }
}

module.exports = TemplateRealizer;