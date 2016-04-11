var React = require("react");
var Link = require("components/Link");
var Outlet = require("components/Outlet");
var config = require('config');
var Icon = require('components/Icon');
const AppState = require('core/AppState');

var BannerItem = React.createClass({
  propTypes: {
    children: React.PropTypes.any,
    onClick: React.PropTypes.func,
  },

  render() {
    return (
      <div
        className="banner__navigation-item"
        children={this.props.children}
        onClick={this.props.onClick}
      />
    );
  }
});

var Banner = React.createClass({
  statics: { BannerItem: BannerItem },

  propTypes: {
    children: React.PropTypes.any,
  },

  render() {
    return (
      <div className="banner-wrapper">
        <header className="banner">
          <h1 className="banner__logo">
            <Link to="home">
              {config.title || 'tinydoc'}
            </Link>

            {' '}

            {config.motto && config.motto.length > 0 && (
              <span className="banner__motto">
                {config.motto}
              </span>
            )}

            {this.props.children}
          </h1>

          <nav className="banner__navigation">
            {config.spotlight && (
              <BannerItem key="spotlight" onClick={this.toggleSpotlight}>
                <Icon className="icon-search" />
              </BannerItem>
            )}

            <Outlet name="Navigation" props={{}} alwaysRenderChildren tagName="span">
              {config.showSettingsLinkInBanner && (
                <BannerItem key="settings">
                  <Link to="settings">
                    <Icon className="icon-cog" />
                  </Link>
                </BannerItem>
              )}
            </Outlet>
          </nav>
        </header>
      </div>
    );
  },

  toggleSpotlight() {
    if (AppState.isSpotlightOpen()) {
      AppState.closeSpotlight();
    }
    else {
      AppState.openSpotlight();
    }
  }
});

module.exports = Banner;