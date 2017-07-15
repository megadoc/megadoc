const React = require("react");
const Link = require("components/Link");
const { Outlet } = require('react-transclusion');
const Icon = require('components/Icon');
const ConfigReceiver = require('components/ConfigReceiver');
const DocumentURI = require('../../DocumentURI');
const BannerItem = require('./BannerItem');
const BannerMenu = require('./BannerMenu');
const getLinkHref = require('./getLinkHref');
const { string, any, arrayOf, object, } = React.PropTypes;
const { PropTypes } = React;

const ConfigType = {
  motto: PropTypes.string,
  title: PropTypes.string,
  spotlight: PropTypes.bool,
  showSettingsLinkInBanner: PropTypes.bool,
};

const Banner = React.createClass({
  statics: { BannerItem: BannerItem },

  propTypes: {
    children: any,
    currentPath: string,
    links: arrayOf(object),
    config: PropTypes.shape(ConfigType),
  },

  contextTypes: {
    appState: PropTypes.object.isRequired,
    documentURI: PropTypes.instanceOf(DocumentURI).isRequired,
  },

  render() {
    const { config } = this.props;

    return (
      <div className="banner-wrapper">
        <header className="banner">
          <h1 className="banner__logo">
            <Link href="/index.html">
              {config.title || 'megadoc'}
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
                  <Link href="/settings.html">
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
        <Link href={getLinkHref(this, link)}>{link.text}</Link>
      </BannerItem>
    );
  },

  toggleSpotlight() {
    if (this.context.appState.isSpotlightOpen()) {
      this.context.appState.closeSpotlight();
    }
    else {
      this.context.appState.openSpotlight();
    }
  }
});

module.exports = ConfigReceiver(Banner, ConfigType);