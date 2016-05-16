const React = require("react");
const classSet = require('utils/classSet');
const Banner = require('./Layout__Banner');
const { getRegionsForDocument } = require('../LayoutEngine');
const LayoutScreen = require('./Layout__Screen');
const scrollToTop = require('utils/scrollToTop');

const { node, shape, string, arrayOf, array, object, oneOfType, oneOf, bool, } = React.PropTypes;
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
    banner: bool,
    fixedSidbar: bool,
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
      banner: true,
      fixedSidbar: true,
      bannerLinks: [],
      customLayouts: []
    };
  },

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.documentNode !== this.props.documentNode) {
      scrollToTop();
    }
  },

  render() {
    const ctx = RenderContext(this.props);
    const className = classSet({
      'root': true,
      'root--with-multi-page-layout': true,
      'root--with-fixed-sidebar': this.props.fixedSidbar,
      'root--with-two-column-layout': ctx.hasSidebarElements,
      'root--with-banner': this.props.banner,
      'root--without-banner': !this.props.banner,
    });

    return (
      <div className={className}>
        {this.props.banner && (
          <Banner
            links={this.props.bannerLinks || []}
            currentPath={this.props.pathname}
          />
        )}

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
      namespaceNode: props.namespaceNode,
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

function RenderContext(props) {
  const defaultRegions = getDefaultRegionsForDocument(props) || getDefaultRegions();
  const customRegions = getRegionsForDocument({
    documentNode: props.documentNode,
    namespaceNode: props.namespaceNode,
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
