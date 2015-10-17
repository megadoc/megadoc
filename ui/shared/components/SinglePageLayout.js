const React = require('react');
const OutletManager = require('core/OutletManager');
const Outlet = require('components/Outlet');
const TwoColumnLayout = require('components/TwoColumnLayout');
const config = require('config');
const { Link } = require('react-router');

OutletManager.define('SinglePageLayout::Sidebar');
OutletManager.define('SinglePageLayout::ContentPanel');

const SinglePageLayout = React.createClass({
  render() {
    const internal = this.isInternalRoute(this.props.routes);

    return (
      <div className="root single-page-layout">
        <TwoColumnLayout>
          <TwoColumnLayout.LeftColumn>
            <div className="single-page-layout__sidebar">
              <Outlet
                name="SinglePageLayout::Sidebar"
                props={this.props}
              />

              <hr />

              {config.allowUserSettings && (
                <Link to="settings">Settings</Link>
              )}
            </div>
          </TwoColumnLayout.LeftColumn>

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

  isInternalRoute(routes) {
    return [ 'settings' ].indexOf(routes[routes.length-1].name) > -1;
  }
});

module.exports = SinglePageLayout;
