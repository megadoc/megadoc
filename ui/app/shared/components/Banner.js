var React = require("react");
var OutletStore = require('stores/OutletStore');
var { Link } = require("react-router");
var config = require('config');
var Icon = require('components/Icon');

var BannerItem = React.createClass({
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
  render() {
    return (
      <div className="banner-wrapper">
        <header className="banner">
          <h1 className="banner__logo">
            <Link to="home">
              {config.title || 'tinydoc'}
            </Link>

            {' '}

            <span className="banner__motto">
              {config.motto || 'Developer reference.'}
            </span>

            {this.props.children}
          </h1>

          <nav className="banner__navigation">
            {OutletStore.getElements('navigation').map(this.renderElement)}

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
    var Element = element.renderer;

    return (
      <BannerItem key={element.key}>
        <Element />
      </BannerItem>
    );
  }
});

module.exports = Banner;