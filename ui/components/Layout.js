const React = require("react");
const classSet = require('utils/classSet');
const Banner = require('./Layout__Banner');
const LayoutScreen = require('./Layout__Screen');
const scrollToTop = require('utils/scrollToTop');
const AppState = require('core/AppState');

const { node, shape, string, arrayOf, array, object, bool, } = React.PropTypes;
const Link = shape({
  text: string,
  href: string,
  links: array
});

const Layout = React.createClass({
  propTypes: {
    children: node,
    pathname: string.isRequired,

    template: shape({
      regions: array,
      hasSidebarElements: bool,
    }).isRequired,

    scope: shape({
      documentNode: object,
      documentEntityNode: object,
      namespaceNode: object,
    }),

    banner: bool,
    fixedSidbar: bool,
    bannerLinks: arrayOf(Link),
  },

  getDefaultProps() {
    return {
      banner: true,
      fixedSidbar: true,
      bannerLinks: [],
    };
  },

  componentWillUpdate(nextProps) {
    if (!AppState.inSinglePageMode()) {
      if (nextProps.scope.documentNode !== this.props.scope.documentNode) {
        scrollToTop();
      }
    }
  },

  render() {
    const { template } = this.props;
    const config = this.props;
    const className = classSet({
      'root': true,
      'root--with-multi-page-layout': true,
      'root--with-fixed-sidebar': config.fixedSidbar,
      'root--with-two-column-layout': template.hasSidebarElements,
      'root--with-banner': config.banner,
      'root--without-banner': !config.banner,
    });

    return (
      <div className={className}>
        {config.banner && (
          <Banner
            links={config.bannerLinks || []}
            currentPath={this.props.pathname}
          />
        )}

        <LayoutScreen {...template} />
      </div>
    );
  },
});

module.exports = Layout;
