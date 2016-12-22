const React = require('react');
const ModuleBody = require('../components/ModuleBody');
const { object, } = React.PropTypes;

module.exports = {
  name: 'CJS::ModuleBody',
  key: 'CJS::ModuleBody',
  component: React.createClass({
    propTypes: {
      documentNode: object,
      namespaceNode: object,
    },

    render() {
      if (!this.props.documentNode.properties) {
        return null;
      }

      return <ModuleBody {...this.props} />;
    }
  }),
};