var React = require('react');
var ColorSchemeSwitcher = require("components/ColorSchemeSwitcher");

var Settings = React.createClass({
  render: function() {
    return (
      <div>
        <h1>Settings</h1>

        <h2>Accessibility</h2>

        <h3>Color Scheme</h3>
        <ColorSchemeSwitcher>Switch color scheme</ColorSchemeSwitcher>
      </div>
    );
  }
});

module.exports = Settings;