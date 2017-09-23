const React = require('react');
const ModuleBody = require('../components/ModuleBody');
const { object, } = React.PropTypes;

module.exports = React.createClass({
  displayName: 'JS::ModuleBody',

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
});
