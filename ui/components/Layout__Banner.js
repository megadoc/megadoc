const React = require("react");
const Link = require("components/Link");
const Outlet = require("components/Outlet");
const config = require('config');
const Icon = require('components/Icon');
const AppState = require('core/AppState');
const DocumentURI = require('core/DocumentURI');
const { string, any, arrayOf, object, } = React.PropTypes;
const BannerItem = require('./Layout__BannerItem');
const BannerMenu = require('./Layout__BannerMenu');

const Banner = React.createClass({
  statics: { BannerItem: BannerItem },

  propTypes: {
    children: any,
    currentPath: string,
    links: arrayOf(object),
  },

  render() {
    return (
      <div className="banner-wrapper">
        <header className="banner">
          <h1 className="banner__logo">
            <Link to="/index.html">
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
              <BannerItem
                key="spotlight"
                onClick={this.toggleSpotlight}
                title="Quick-Jump (Ctrl+K or CMD+K)"
              >
                <Icon className="icon-search" />
              </BannerItem>
            )}

            <Outlet
              name="MultiPageLayout::Banner"
              alwaysRenderChildren
              tagName="span"
              fnRenderElement={(key, props, Type) => (
                <BannerItem key={key}>
                  <Type {...props} />
                </BannerItem>
              )}
            >
              {config.showSettingsLinkInBanner && (
                <BannerItem key="settings">
                  <Link to="settings">
                    <Icon className="icon-cog" />
                  </Link>
                </BannerItem>
              )}

              {this.props.links.map(this.renderLink)}
            </Outlet>
          </nav>
        </header>
      </div>
    );
  },

  renderLink(link) {
    if (link.links) {
      return (
        <BannerItem key={link.text}>
          <BannerMenu currentPath={this.props.currentPath} {...link} />
        </BannerItem>
      );
    }

    return (
      <BannerItem key={link.text}>
        <Link to={DocumentURI.withExtension(link.href)}>{link.text}</Link>
      </BannerItem>
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