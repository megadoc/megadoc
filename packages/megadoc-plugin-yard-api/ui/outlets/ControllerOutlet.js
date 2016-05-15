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
    return (
      <Component config={this.props.namespaceNode.config} {...this.props} />
    );
  }
});

tinydoc.outlets.add('YARD-API::Controller', {
  key: 'YARD-API::Controller',
  component: ControllerOutlet
});

