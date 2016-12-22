const React = require('react');
const ClassEntityBrowser = require('../components/ClassEntityBrowser');
const { object, } = React.PropTypes;

module.exports = {
  name: 'CJS::ModuleEntities',
  key: 'CJS::ModuleEntities',
  component: React.createClass({
    propTypes: {
      documentNode: object,
      documentEntityNode: object,
    },

    render() {
      if (!this.props.documentNode) {
        return null;
      }

      return (
        <ClassEntityBrowser
          standalone
          documentNode={this.props.documentNode}
          documentEntityNode={this.props.documentEntityNode}
        />
      );
    }
  }),
};