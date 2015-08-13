var React = require("react");
var Button = require("components/Button");
var Icon = require("components/Icon");
var { AVAILABLE_SCHEMES, DEFAULT_SCHEME } = require("constants");

var ColorSchemeSwitcher = React.createClass({
  componentDidMount: function() {
    var startingScheme;
    try {
      startingScheme = localStorage.getItem('colorScheme');
    }
    finally {
      startingScheme = startingScheme || DEFAULT_SCHEME;
    }

    document.body.className = startingScheme;
  },

  render() {
    return(
      <Button
        onClick={this.switchScheme}
        className="color-scheme-switcher"
        title="Switch Color Scheme"
      >
        <Icon className="icon-contrast" />
      </Button>
    );
  },

  switchScheme: function() {
    var className = document.body.className;
    var currScheme, nextScheme;

    AVAILABLE_SCHEMES.some(function(scheme, i) {
      if (className.indexOf(scheme) > -1) {
        currScheme = scheme;
        nextScheme = AVAILABLE_SCHEMES[i+1] || AVAILABLE_SCHEMES[0];
        return true;
      }
    });

    className = className.replace(currScheme, nextScheme);

    document.body.className = className;

    try {
      localStorage.setItem('colorScheme', nextScheme);
    }
    catch (e) {

    }
  }
});

module.exports = ColorSchemeSwitcher;