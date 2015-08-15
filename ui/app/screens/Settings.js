var React = require('react');
var ColorSchemeSwitcher = require("components/ColorSchemeSwitcher");
var Icon = require("components/Icon");
var Checkbox = require("components/Checkbox");
var Storage = require('core/Storage');

var Settings = React.createClass({
  render: function() {
    return (
      <div className="settings">
        <h1>Settings</h1>

        <p>
          <Checkbox
            onChange={this.toggleHighlighting}
            checked={this.isHighlightingEnabled()}
          >
            Enable syntax highlighting
          </Checkbox>
        </p>

        <h2>Color Scheme <Icon className="icon-contrast" /></h2>

        <p>Choose your preferred color palette for easier reading.</p>

        <ColorSchemeSwitcher />

        <div className="settings__controls">
          <button className="btn" onClick={this.reset}>Reset settings</button>
        </div>
      </div>
    );
  },

  isHighlightingEnabled() {
    return Storage.get('highlightingEnabled', true);
  },

  toggleHighlighting() {
    Storage.set('highlightingEnabled', !this.isHighlightingEnabled());
  },

  reset() {
    Storage.clear();
  }
});

module.exports = Settings;