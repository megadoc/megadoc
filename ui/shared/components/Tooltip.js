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
    this.computePositions(this.props.target);
  },

  componentWillUpdate(nextProps) {
    if (nextProps.target !== this.props.target) {
      this.computePositions(nextProps.target);
    }
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

  computePositions(targetNode) {
    const bbox = targetNode.getBoundingClientRect();
    let { top, left } = bbox;
    top += bbox.height

    if (top !== this.state.top || left !== this.state.left) {
      this.setState({ top, left, });
    }
  }
});

module.exports = Tooltip;
