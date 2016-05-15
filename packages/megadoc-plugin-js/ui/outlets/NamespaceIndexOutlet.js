const React = require('react');
const { object, } = React.PropTypes;
const NamespaceIndex = require('../components/NamespaceIndex');

megadoc.outlets.add('CJS::NamespaceIndex', {
  key: 'CJS::NamespaceIndex',
  component: React.createClass({
    propTypes: {
      documentNode: object,
      namespaceNode: object,
    },

    render() {
      return (
        <NamespaceIndex {...this.props} />
      );
    }
  }),
});