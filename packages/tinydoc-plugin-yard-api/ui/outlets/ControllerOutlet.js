const React = require('react');
const Component = require('../components/APIResource');

const ControllerOutlet = React.createClass({
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

