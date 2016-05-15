const React = require('react');
const ClassBrowser = require('../components/ClassBrowser');
const { object, } = React.PropTypes;

megadoc.outlets.add('CJS::ClassBrowser', {
  key: 'CJS::ClassBrowser',
  component: React.createClass({
    propTypes: {
      documentNode: object,
      namespaceNode: object,
    },

    render() {
      const { documentNode } = this.props;
      const legacyParams = {
        moduleId: documentNode.type === 'DocumentEntity' ? documentNode.parentNode.uid : documentNode.uid,
        entity: documentNode.type === 'DocumentEntity' ? documentNode.uid : undefined,
      };

      return (
        <div>
          <ClassBrowser
            activeModuleId={legacyParams.moduleId}
            activeEntityId={legacyParams.entity}
            namespaceNode={this.props.namespaceNode}
            documentNode={this.props.documentNode}
            withControls={false}
          />
        </div>
      );
    }
  }),
});