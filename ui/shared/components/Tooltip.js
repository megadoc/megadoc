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
    // const top = targetNode.offsetTop + targetNode.offsetHeight + 6;
    // const left = targetNode.offsetLeft;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    // top += scrollTop;
    // left += scrollLeft;
    top += bbox.height

    if (top !== this.state.top || left !== this.state.left) {
      this.setState({ top, left, });
    }
  }
});

module.exports = Tooltip;
