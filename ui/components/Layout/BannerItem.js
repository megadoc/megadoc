const React = require("react");
const { node, func, string, } = React.PropTypes;

const BannerItem = React.createClass({
  propTypes: {
    children: node,
    onClick: func,
    title: string,
  },

  render() {
    return (
      <div
        className="banner__navigation-item"
        children={this.props.children}
        onClick={this.props.onClick}
        title={this.props.title}
      />
    );
  }
});

module.exports = BannerItem;