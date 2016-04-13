const React = require('react');
const { instanceOf, node, } = React.PropTypes;

const Tooltip = React.createClass({
  propTypes: {
    target: instanceOf(Element).isRequired,
    children: node.isRequired,
  },

  getInitialState() {
    return {
      top: 0,
      left: 0
    };
  },

  componentDidMount() {
    this.computePositions();
  },

  render() {
    return (
      <div
        style={this.state}
        className="tooltip"
        children={this.props.children}
      />
    );
  },

  computePositions() {
    const targetNode = this.props.target;

    this.setState({
      top: targetNode.offsetTop + targetNode.offsetHeight + 6,
      left: targetNode.offsetLeft,
    });
  }
});

module.exports = Tooltip;
