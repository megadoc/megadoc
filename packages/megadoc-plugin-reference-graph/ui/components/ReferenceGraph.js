const React = require('react');
const Link = require('components/Link');
const { PropTypes } = React;

const ReferenceGraph = React.createClass({
  contextTypes: {
    corpus: PropTypes.object.isRequired,
  },

  propTypes: {
    documentNode: PropTypes.object,
  },

  render() {
    const { documentNode } = this.props;

    if (!documentNode || !documentNode.meta.references) {
      return null;
    }

    const inbound = documentNode.meta.references.inbound.filter(uid => uid !== documentNode.uid).map(uid =>
      this.context.corpus.getByUID(uid)
    )

    if (!inbound.length) {
      return null;
    }

    return (
      <div>
        <h2>Related Documents</h2>
        <ul>
          {inbound.map(linkedNode =>
            <li key={linkedNode.uid}>
              <Link to={linkedNode}>{linkedNode.title}</Link>
            </li>
          )}
        </ul>
      </div>
    )
  }
});

module.exports = ReferenceGraph;