var React = require("react");
var { number } = React.PropTypes;

var Indent = React.createClass({
  propTypes: {
    level: number
  },

  render() {
    return(
      <div
        className={"whitespace-indent whitespace-indent--level-" + Math.min(this.props.level, 3)}
      />
    );
  }
});

module.exports = Indent;