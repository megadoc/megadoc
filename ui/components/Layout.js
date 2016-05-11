const React = require("react");
const Outlet = require('components/Outlet');
const TwoColumnLayout = require('components/TwoColumnLayout');
const classSet = require('utils/classSet');
const NotFound = require('components/NotFound');
const Document = require('components/Document');
const ErrorMessage = require('components/ErrorMessage');
const Banner = require('./Layout__Banner');
const { getRegionsForDocument } = require('./Layout__Utils');
const LayoutScreen = require('./Layout__Screen');

const { node, shape, string, arrayOf, array, object, oneOfType, oneOf } = React.PropTypes;
const Link = shape({
  text: string,
  href: string,
  links: array
});

const Layout = React.createClass({
  statics: {
    getDefaultRegionsForDocument,
    getRegionsForDocument,
  },

  propTypes: {
    children: node,
    pathname: string.isRequired,
    documentNode: object,
    documentEntityNode: object,
    namespaceNode: object,
    bannerLinks: arrayOf(Link),
    customLayouts: arrayOf(shape({
      match: shape({
        by: oneOf([ 'url', 'uid', 'type' ]).isRequired,
        on: oneOfType([ string, arrayOf(string) ]).isRequired,
      }).isRequired,

      using: string,

      regions: arrayOf(shape({
        name: string.isRequired,
        options: object,

        outlets: arrayOf(shape({
          name: string,
          options: object,
          using: oneOfType([ string, arrayOf(string) ]),
        }))
      }))
    })),
  },

  getDefaultProps() {
    return {
      bannerLinks: [],
      customLayouts: []
    };
  },

  render() {
    const ctx = RenderContext(this.props);
    const className = classSet({
      'root': true,
      'root--with-multi-page-layout': true,
      'root--with-two-column-layout': ctx.hasSidebarElements
    });

    return (
      <div className={className}>
        <Banner
          links={this.props.bannerLinks || []}
          currentPath={this.props.pathname}
        />

        <LayoutScreen {...ctx} />
      </div>
    );
  },
});

module.exports = Layout;

function getDefaultRegionsForDocument(props) {
  if (props.namespaceNode && props.namespaceNode.meta.defaultLayouts) {
    return getRegionsForDocument({
      documentNode: props.documentNode,
      layouts: props.namespaceNode.meta.defaultLayouts,
      pathname: props.pathname
    });
  }
}

function getDefaultRegions() {
  return [
    {
      name: 'Layout::Content',
      outlets: null
    }
  ];
}

function getNodesForOutlet(outlet, defaults) {
  if (!outlet.using) {
    return defaults;
  }

  const documentNode = tinydoc.corpus.get(outlet.using);

  if (documentNode) {
    return {
      documentNode,
      namespaceNode: tinydoc.corpus.getNamespaceOfDocument(documentNode)
    }
  }
  else {
    return null;
  }
}

function RenderContext(props) {
  const defaultRegions = getDefaultRegionsForDocument(props) || getDefaultRegions();
  const customRegions = getRegionsForDocument({
    documentNode: props.documentNode,
    layouts: props.customLayouts,
    pathname: props.pathname
  });

  const regions = customRegions || defaultRegions;

  return {
    regions,
    regionSource: customRegions ? 'custom' : 'default',
    documentNode: props.documentNode,
    documentEntityNode: props.documentEntityNode,
    namespaceNode: props.namespaceNode,
    hasSidebarElements: regions.some(x => x.name === 'Layout::Sidebar')
  };
}
