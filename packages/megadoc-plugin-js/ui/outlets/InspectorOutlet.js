const React = require('react');
const K = require('../constants');
const { shape, string } = React.PropTypes;

module.exports = {
  name: 'Inspector',
  key: 'CJS::Inspector',

  match(props) {
    return props.namespaceNode.name === 'megadoc-plugin-js' && props.documentNode.properties;
  },

  component: React.createClass({
    propTypes: {
      documentNode: shape({
        properties: shape({
          summary: string
        })
      }),

      namespaceNode: shape({
        title: string
      }),
    },

    render() {
      const { documentNode, namespaceNode } = this.props;
      const doc = documentNode.properties;

      return (
        <div>
          <div className="tooltip__title">
            {doc.id} ({doc.type !== K.TYPE_UNKNOWN && (
              <strong>{doc.type} </strong>
            )}in {namespaceNode.title})
          </div>

          <p children={documentNode.summary} />
        </div>
      );
    }
  })
};