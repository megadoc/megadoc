const React = require("react");
const Banner = require('./Banner');
const Footer = require('components/Footer');
const Outlet = require('components/Outlet');
const TwoColumnLayout = require('components/TwoColumnLayout');
const classSet = require('utils/classSet');
const RouteHandler = require('components/RouteHandler');

const { node, shape, string, arrayOf, array, } = React.PropTypes;
const Link = shape({
  text: string,
  href: string,
  links: array
});

const MultiPageLayout = React.createClass({
  propTypes: {
    children: node,
    path: string,
    config: shape({
      bannerLinks: arrayOf(Link)
    })
  },

  render() {
    const hasSidebarElements = Outlet.hasMatchingElements({
      name: 'MultiPageLayout::Sidebar',
      elementProps: this.props
    });

    const className = classSet({
      'root': true,
      'root--with-multi-page-layout': true,
      'root--with-two-column-layout': hasSidebarElements
    });

    return (
      <div className={className}>
        <Banner
          links={this.props.config.bannerLinks}
          currentPath={this.props.path}
        />

        <div className="root__screen">
          {hasSidebarElements ?
            this.renderTwoColumnLayout() :
            this.renderSingleColumnLayout()
          }
        </div>

      </div>
    );
  },

  renderTwoColumnLayout() {
    return (
      <TwoColumnLayout>
        <TwoColumnLayout.LeftColumn>
          <Outlet name="MultiPageLayout::Sidebar" elementProps={this.props} />
        </TwoColumnLayout.LeftColumn>

        <TwoColumnLayout.RightColumn>
          <div>
            <Outlet name="MultiPageLayout::Content" elementProps={this.props}>
              <RouteHandler />
            </Outlet>

            <Footer />
          </div>
        </TwoColumnLayout.RightColumn>
      </TwoColumnLayout>
    );
  },

  renderSingleColumnLayout() {
    return (
      <Outlet name="MultiPageLayout::Content" elementProps={this.props}>
        <div>
          <RouteHandler />
          <Footer />
        </div>
      </Outlet>
    );
  },

  reload() {
    this.forceUpdate();
  },
});

module.exports = function(config) {
  return React.createClass({
    render() {
      return <MultiPageLayout {...this.props} config={config} />
    }
  });
};