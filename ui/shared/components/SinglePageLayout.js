const React = require('react');
const Outlet = require('components/Outlet');
const TwoColumnLayout = require('components/TwoColumnLayout');
const config = require('config');
const Link = require('components/Link');
const Footer = require('components/Footer');
const Heading = require('components/Heading');
const classSet = require('utils/classSet');

const { arrayOf, shape, string, node } = React.PropTypes;
const SinglePageLayout = React.createClass({
  propTypes: {
    routes: arrayOf(shape({ name: string })),
    children: node,
  },

  componentDidMount: function() {
    Heading.setStartingLevel(2);
  },

  componentWillUnmount: function() {
    Heading.restoreStartingLevel();
  },

  render() {
    // TODO: this is really weird
    const internal = this.isInternalRoute(this.props.routes);

    return (
      <div className="root root--with-single-page-layout">
        <TwoColumnLayout>
          {this.renderSidebar()}

          <TwoColumnLayout.RightColumn>
            <div className="single-page-layout__content">
              {internal && this.props.children}

              {!internal && (
                <Outlet
                  name="SinglePageLayout::ContentPanel"
                  props={this.props}
                />
              )}
            </div>
          </TwoColumnLayout.RightColumn>
        </TwoColumnLayout>
      </div>
    );
  },

  renderSidebar() {
    const className = classSet({
      "single-page-layout__sidebar": true
    });

    return (
      <TwoColumnLayout.LeftColumn>
        <div className={className}>
          <Outlet
            name="SinglePageLayout::Sidebar"
            props={this.props}
          />

          {config.allowUserSettings && (
            <Link to="settings">Settings</Link>
          )}
        </div>
      </TwoColumnLayout.LeftColumn>
    );
  },

  isInternalRoute(routes) {
    return [ 'settings' ].indexOf(routes[routes.length-1].name) > -1;
  }
});

module.exports = SinglePageLayout;
