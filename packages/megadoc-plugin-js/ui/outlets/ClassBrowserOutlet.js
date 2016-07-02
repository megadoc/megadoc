const React = require('react');
const ClassBrowser = require('../components/ClassBrowser');
const { object, } = React.PropTypes;

megadoc.outlets.add('CJS::ClassBrowser', {
  key: 'CJS::ClassBrowser',
  match(x) { return x.namespaceNode.name === 'megadoc-plugin-js'; },

  component: React.createClass({
    propTypes: {
      documentNode: object,
      namespaceNode: object,
      documentEntityNode: object,
    },

    render() {
      return (
        <ClassBrowser
          namespaceNode={this.props.namespaceNode}
          documentNode={this.props.documentNode}
          documentEntityNode={this.props.documentEntityNode}
          withControls={this.props.namespaceNode.enableSidebarControls !== false}
        />
      );
    }
  }),
});