const React = require('react');
const K = require('constants');

module.exports = function(api, config) {
  tinydoc.outlets.add('Inspector', {
    key: config.routeName,

    match(props) {
      return props.namespaceNode.id === config.routeName;
    },

    component: React.createClass({
      render() {
        const { documentNode, namespaceNode } = this.props;
        const doc = documentNode.properties;

        return (
          <div>
            <div className="tooltip__title">
              {doc.id} ({doc.ctx.type !== K.TYPE_UNKNOWN && (
                <strong>{doc.ctx.type} </strong>
              )}in {namespaceNode.corpusContext})
            </div>

            <p children={documentNode.summary} />
          </div>
        );

      }
    })
  })
};
