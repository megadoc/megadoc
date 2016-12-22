const React = require('react');
const ClassBrowser = require('../components/ClassBrowser');
const { object, shape, bool, } = React.PropTypes;

module.exports = {
  name: 'CJS::ClassBrowser',
  key: 'CJS::ClassBrowser',
  match(x) { return x.namespaceNode.name === 'megadoc-plugin-js'; },

  component: React.createClass({
    propTypes: {
      documentNode: object,
      namespaceNode: object,
      documentEntityNode: object,
      $outletOptions: shape({
        flat: bool,
      })
    },

    render() {
      return (
        <ClassBrowser
          namespaceNode={this.props.namespaceNode}
          documentNode={this.props.documentNode}
          documentEntityNode={this.props.documentEntityNode}
          withControls={this.props.namespaceNode.enableSidebarControls !== false}
          flat={this.props.$outletOptions.flat}
        />
      );
    }
  }),
}