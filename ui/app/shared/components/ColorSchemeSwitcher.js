var React = require("react");
var Button = require("components/Button");
var Icon = require("components/Icon");
var ColorSchemeManager = require('core/ColorSchemeManager');

var ColorSchemeSwitcher = React.createClass({
  render() {
    return (
      <Button
        onClick={this.switchScheme}
        className="color-scheme-switcher"
        title="Switch Color Scheme"
      >
        <Icon className="icon-contrast" />
        {' '}
        {this.props.children}
      </Button>
    );
  },

  switchScheme: function() {
    ColorSchemeManager.switchScheme();
  }
});

module.exports = ColorSchemeSwitcher;