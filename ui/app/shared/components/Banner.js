var React = require("react");
var OutletManager = require('core/OutletManager');
var Link = require("components/Link");
var config = require('config');
var Icon = require('components/Icon');

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
            {OutletManager.getElements('navigation').map(this.renderElement)}

            <BannerItem key="settings">
              <Link to="settings">
                <Icon className="icon-cog" />
              </Link>
            </BannerItem>
          </nav>
        </header>
      </div>
    );
  },

  renderElement(element) {
    var Element = element;

    return (
      <BannerItem key={element.key}>
        <Element />
      </BannerItem>
    );
  }
});

module.exports = Banner;