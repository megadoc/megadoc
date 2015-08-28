var React = require("react");

var Icon = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
  },

  render() {
    return (
      <i {...this.props} className={"icon " + this.props.className} />
    );
  }
});

module.exports = Icon;