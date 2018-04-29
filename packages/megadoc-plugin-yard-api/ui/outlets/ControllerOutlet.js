const React = require('react');
const Component = require('../components/APIResource');
const { shape, object } = React.PropTypes;

const ControllerOutlet = React.createClass({
  propTypes: {
    namespaceNode: shape({
      config: object,
    }),
  },

  render() {
    const { documentNode } = this.props

    if (!documentNode) {
      return null
    }

    return (
      <Component config={this.props.namespaceNode.config} {...this.props} />
    );
  }
});

module.exports = ControllerOutlet
