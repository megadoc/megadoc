var React = require("react");
var Radio = require("components/Radio");
var { AVAILABLE_SCHEMES, AVAILABLE_SCHEME_NAMES } = require("constants");
var ColorSchemeManager = require('core/ColorSchemeManager');

var ColorSchemeSwitcher = React.createClass({
  render() {
    return (
      <div className="color-scheme-switcher">
        {AVAILABLE_SCHEMES.map(this.renderSchemeOption)}
      </div>
    );
  },

  setScheme(e) {
    ColorSchemeManager.setScheme(e.target.value);
  },

  renderSchemeOption(scheme, i) {
    return (
      <Radio
        key={scheme}
        spanner
        className="color-scheme-switcher__option"
        value={scheme}
        checked={ColorSchemeManager.getCurrentScheme() === scheme}
        onChange={this.setScheme}
      >
        {AVAILABLE_SCHEME_NAMES[i]}
      </Radio>
    );
  }
});

module.exports = ColorSchemeSwitcher;