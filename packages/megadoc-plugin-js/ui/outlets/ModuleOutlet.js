const React = require('react');
const Module = require('../components/Module');
const { object, } = React.PropTypes;

megadoc.outlets.add('CJS::Module', {
  key: 'CJS::Module',
  component: React.createClass({
    propTypes: {
      documentNode: object.isRequired,
      namespaceNode: object.isRequired,
    },

    render() {
      if (!this.props.documentNode.properties) {
        return null;
      }

      return (
        <Module {...this.props} />
      );
    }
  }),
});