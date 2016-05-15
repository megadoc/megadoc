const React = require('react');
const Module = require('../components/Module');
const { object, } = React.PropTypes;

tinydoc.outlets.add('CJS::Module', {
  key: 'CJS::Module',
  component: React.createClass({
    propTypes: {
      documentNode: object,
      namespaceNode: object,
    },

    render() {
      if (!this.props.documentNode.properties) {
        return null;
      }

      return (
        <Module
          namespaceNode={this.props.namespaceNode}
          documentNode={this.props.documentNode}
        />
      );
    }
  }),
});