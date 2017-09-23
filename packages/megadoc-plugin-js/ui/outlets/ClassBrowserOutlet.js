const React = require('react');
const ClassBrowser = require('../components/ClassBrowser');
const { object, shape, bool, } = React.PropTypes;

module.exports = React.createClass({
  displayName: 'JS::BrowserOutlet',
  propTypes: {
    documentNode: object,
    namespaceNode: object,
    documentEntityNode: object,
    $outletOptions: shape({
      flat: bool,
      linkNamespaces: bool,
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
        linkToNamespaces={this.props.$outletOptions.linkNamespaces}
      />
    );
  }
});
