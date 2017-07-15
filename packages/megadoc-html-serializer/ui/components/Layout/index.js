const React = require("react");
const classSet = require('utils/classSet');
const Banner = require('./Banner');
const LayoutScreen = require('./Screen');
const scrollToTop = require('utils/scrollToTop');
const { PropTypes } = React;

const { node, shape, string, arrayOf, array, object, bool, } = React.PropTypes;
const Link = shape({
  text: string,
  href: string,
  links: array
});

const Layout = React.createClass({
  contextTypes: {
    appState: object.isRequired,
  },

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

    config: PropTypes.shape({
      fixedSidebar: PropTypes.bool,
      banner: bool,
      bannerLinks: arrayOf(Link),
    }).isRequired,
  },

  getDefaultProps() {
    return {
      bannerLinks: [],
    };
  },

  componentWillUpdate(nextProps) {
    if (!this.context.appState.inSinglePageMode()) {
      if (nextProps.scope.documentNode !== this.props.scope.documentNode) {
        scrollToTop();
      }
    }
  },

  render() {
    const { template, config } = this.props;
    const className = classSet({
      'root': true,
      'root--with-multi-page-layout': true,
      'root--with-two-column-layout': template.hasSidebarElements,
      'root--with-fixed-sidebar': config.fixedSidebar,
      'root--with-static-sidebar': !config.fixedSidebar,
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
