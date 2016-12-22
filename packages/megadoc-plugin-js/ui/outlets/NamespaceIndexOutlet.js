const React = require('react');
const { object, } = React.PropTypes;
const NamespaceIndex = require('../components/NamespaceIndex');

module.exports = {
  name: 'CJS::NamespaceIndex',
  key: 'CJS::NamespaceIndex',
  component: React.createClass({
    propTypes: {
      documentNode: object,
      namespaceNode: object,
    },

    render() {
      return (
        <NamespaceIndex
          documentNode={this.props.documentNode || this.props.namespaceNode}
        />
      );
    }
  }),
}