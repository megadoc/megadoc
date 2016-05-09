const React = require('react');
const { object, } = React.PropTypes;
const NamespaceIndex = require('../components/NamespaceIndex');

tinydoc.outlets.add('CJS::NamespaceIndex', {
  key: 'CJS::NamespaceIndex',
  component: React.createClass({
    propTypes: {
      documentNode: object,
      namespaceNode: object,
    },

    render() {
      const { documentNode } = this.props;

      // if (documentNode.type !== 'Document') {
      //   console.warn(
      //     "Invalid document '%s' passed to the CJS::NamespaceIndex outlet; " +
      //     "expected a namespace or a module.",
      //     documentNode.uid
      //   );

      //   return null;
      // }

      return (
        <NamespaceIndex {...this.props} />
      );
    }
  }),
});